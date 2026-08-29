<?php
// High performance pagetemplate backlink
// subsystem
// @author 'Luke Howson'

if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');

class PageTemplateBacklink {
    function getBacklinks($id) {
        $checkedBacklinks = array();
        $backlinks = $this->_load($id);
        foreach ($backlinks as $backlink) {
            $link = $this->_verifyLink($backlink, $id);
            if ( $link) {
                $checkedBacklinks[] = $link;
            }
        }
        $this->_save($checkedBacklinks, $id);
        return $checkedBacklinks;
    }
    
    function _save($backlinks, $page) {
        if (!sizeof($backlinks) ) return;
        $pickle = serialize($backlinks);
        $file = $this->_pageTemplateMetaFN($page);
        io_makeFileDir($file);
        io_saveFile($file, $pickle);
        return;
    }
    
    function _load($page) {
        $file = $this->_pageTemplateMetaFN($page);
        $backlinks = array();
        if ( file_exists($file) ) {
            $contents = io_readFile($file);
            $backlinks = unserialize($contents);
        }
        return $backlinks;
    }
    
    function insert($backlink) {
        $to = $backlink[1];
        $context = $backlink[4];
        $context = getNS($context);
        $to = resolve_id($context,$to);
        $backlinks = $this->_load($to);
        foreach ($backlinks as $bl) {
            if ($bl == $backlink) return;
        }
        $backlinks[] = $backlink;
        $this->_save($backlinks, $to);
        return;
    }
    
    function _verifyLink($backlink, $to) {
        //absolute search id
        $to = cleanID($to);
      
        $page = $backlink[4];
        $file = wikiFN($page);
        if (!file_exists($file)) return false;
         
        //fetch instructions
        global $__PAGETEMPLATE_ID;
        $__PAGETEMPLATE_ID = $page;
        $instructions = _pt_get_instructions(io_readfile($file));
        if(is_null($instructions)) return false;
        $ret = false;
      
        //check all links for match
        foreach($instructions as $ins){
          if($ins[0] == 'plugin' && $ins[1][0] == 'pagetemplate' && strlen($ins[1][1][0]) > 0) {
            $mid = $ins[1][1][1];
            resolve_pageid(getNS($page),$mid,$exists); //exists is not used
            if($mid == $to){
              //we have a match - finish
              $ins[1][1][1] = resolve_id($cns,$ins[1][1][1]);
              $ins[1][1][2] = resolve_id($cns,$ins[1][1][2]);
              $backlink = $ins[1][1];
              return $backlink;
            }
          }
        }
        return false;
    }
    
    function _pageTemplateMetaFN($raw_id,$rev='',$clean=true){
      global $conf;
    
      $id = cleanID($raw_id);
      $id = str_replace(':','/',$raw_id);
      $id .= '.link';
      $backlinkDir = DOKU_PLUGIN.'/pagetemplate';
      $backlinkDir .= '/cache';
      $fn = $backlinkDir.'/'.utf8_encodeFN($id);
      io_makeFileDir($fn);
      return $fn;
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

}