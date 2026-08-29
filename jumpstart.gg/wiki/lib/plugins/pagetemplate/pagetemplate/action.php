<?php
/**
 * Pagetemplate action plugin
 * 
 * @author     Luke Howson <mail@lukehowson.com>
 */
 
if(!defined('DOKU_INC')) die();
if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once(DOKU_PLUGIN.'action.php');
require_once(DOKU_INC.'inc/parserutils.php');
require_once(DOKU_INC.'inc/search.php');
require_once(DOKU_INC.'inc/parser/parser.php');
require_once('pagetemplate_backlinks.php');
 
class action_plugin_pagetemplate extends DokuWiki_Action_Plugin {
 
  /**
   * return some info
   */
  function getInfo(){
    return array(
		 'author' => 'Luke Howson',
		 'email'  => 'mail@lukehowson.com',
		 'date'   => '2007-07-25',
		 'name'   => 'Page Template',
		 'desc'   => 'Generates a template when Create this Page is clicked.',
		 );
  }
 
  /*
   * Register its handlers with the dokuwiki's event controller
   */
  function register(Doku_Event_Handler $controller) {
    $controller->register_hook('HTML_PAGE_FROMTEMPLATE', 'BEFORE',  $this, '_generateTemplate');
    $controller->register_hook('HTML_PAGE_FROMTEMPLATE', 'AFTER',  $this, '_removeTemplate');
  }
  
  function _removeTemplate(&$event, $param) {
    $page = getID();
    $theTemplate = _templateFN($page);
    if (file_exists($theTemplate)) {
        unlink($theTemplate);
        io_sweepNS($page);
    }
    $backup = $theTemplate.'.bak';
    if (file_exists($backup) ) {
      io_rename($backup,$theTemplate);
    }
    return;
  }

  /**
   * Hooked into a newly created page (as editor boots up).
   */
  function _generateTemplate(&$event, $param) {
        // page already exists?
        $page = getID();
        $pageFile = wikiFN($page);
        if(file_exists($pageFile) ) {
            return;
        }
        global $conf;
        $ID = getID();
        //$ID = $event->data[0];
        $backlinks = array();
        $lib = new PageTemplateBacklink;
        $backlinks = $lib->getBacklinks($ID);
        if (!sizeof($backlinks)) return;
        $firstLink = $backlinks[0];
        $templatePage = $firstLink[2];
        $context = $firstLink[4];
        $templatePage = resolve_id(getNS($context),$templatePage);
        // $displayName = $firstLink[3];
        $pageName = $firstLink[1];
        $pageName = resolve_id(getNS($context),$pageName);
        $fp = wikiFN($pageName);
        $templateFile = wikiFN($templatePage);
        $newTemplate = _templateFN($pageName);
        $backup = $newTemplate.'.bak';
        if (file_exists($newTemplate) ) {
          io_rename($newTemplate,$backup);
        }

        io_makeFileDir($newTemplate);
        copy($templateFile, $newTemplate);
        return;
  }
}

function _templateFN($pageName) {
  $newTemplate = resolve_id(getNS($pageName),'template');
  $newTemplate = wikiFN($newTemplate);
  $newTemplate = preg_replace('/(?<=\\/)(?=template.txt$)/','_',$newTemplate);
  // hack for page / subpage model
  $newTemplate = preg_replace('/(?<=\\/)template\\/page.txt$/','_template.txt',$newTemplate);
  return $newTemplate;
}

function _pt_search_backlinks(&$data,$base,$file,$type,$lvl,$opts){
  //we do nothing with directories
  if($type == 'd') return true;;
  //only search txt files
  if(!preg_match('#\.txt$#',$file)) return true;;

  //absolute search id
  $sid = parentNS(cleanID($opts['ns'].':'.$opts['name']));

  //current id and namespace
  $cid = pathID($file);
  $cns = parentNS($cid);

  //check ACL
  if(auth_quickaclcheck($cid) < AUTH_READ){
    return false;
  }

  //fetch instructions
  $instructions = _pt_get_instructions(io_readfile($base.$file));
  if(is_null($instructions)) return false;
  $ret = false;

  //check all links for match
  foreach($instructions as $ins){
    if($ins[0] == 'plugin' && $ins[1][0] == 'pagetemplate' && strlen($ins[1][1][0]) > 0) {
      $mid = $ins[1][1][1];
      resolve_pageid($cns,$mid,$exists); //exists is not used
      if($mid == $sid){
        //we have a match - finish
        $ins[1][1][1] = resolve_id($cns,$ins[1][1][1]);
        $ins[1][1][2] = resolve_id($cns,$ins[1][1][2]);
        $data[]['id'] = $ins[1][1];
        break;
      }
    }
  }
  return false;
}

function _pt_get_instructions($text) {
    // get the instructions
      // Create the parser
  $Parser = & new Doku_Parser();

  // Add the Handler
  $Parser->Handler = & new Doku_Handler();

  //add modes to parser
  $pagetemplate_obj =& plugin_load('syntax','pagetemplate');
  $std_modes = array('listblock','preformatted','notoc','nocache',
                     'header','table','linebreak','footnote','hr',
                     'unformatted','php','html','code','file','quote',
                     'internallink','rss','media','externallink',
                     'emaillink','windowssharelink','eol');
  foreach($std_modes as $m){
    $class = "Doku_Parser_Mode_$m";
    $obj   = new $class();
    $mode = array(
                 'sort' => $obj->getSort(),
                 'mode' => $m,
                 'obj'  => $obj
               );
    $Parser->addMode($m,$obj);    
  }
  $Parser->addMode('plugin_pagetemplate',$pagetemplate_obj);
  // Do the parsing
  $p = $Parser->parse($text);
  return $p;
}