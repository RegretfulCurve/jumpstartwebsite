<?php
/**
 * JumpStart Plugin — action.php
 * Hooks: user profile page intercept, userprofile JSON API, banner save/load, profile edit
 */

if (!defined('DOKU_INC')) die();

class action_plugin_jumpstart extends DokuWiki_Action_Plugin {

    public function register(Doku_Event_Handler $controller) {
        $controller->register_hook('ACTION_ACT_PREPROCESS', 'BEFORE', $this, 'handle_userprofile_api');
        $controller->register_hook('ACTION_ACT_PREPROCESS', 'BEFORE', $this, 'handle_searchusers');
        $controller->register_hook('TPL_ACT_RENDER',        'BEFORE', $this, 'handle_profile_page');
        $controller->register_hook('TPL_ACT_RENDER',        'BEFORE', $this, 'handle_profile_edit_page');
        $controller->register_hook('TPL_ACT_RENDER',        'BEFORE', $this, 'handle_login_page');
        $controller->register_hook('TPL_ACT_RENDER',        'BEFORE', $this, 'handle_register_page');
        $controller->register_hook('AUTH_LOGIN_CHECK',      'AFTER',  $this, 'handle_user_login');
        $controller->register_hook('TPL_METAHEADER_OUTPUT', 'BEFORE', $this, 'load_live_scripts');
    }
/* ── Load live page scripts ── */
public function load_live_scripts(Doku_Event $event, $param) {
    $event->data['script'][] = [
        'type'  => 'text/javascript',
        'src'   => tpl_basedir() . 'user/jumpstart-live.js',
        '_data' => '',
    ];
}
    /* ── Stamp joined date on first login ── */
    public function handle_user_login(Doku_Event $event, $param) {
        $username = $_SERVER['REMOTE_USER'] ?? '';
        if (!$username) return;
        if ($this->load_user_meta($username, 'joined')) return;
        $this->save_user_meta($username, 'joined', date('M j, Y'));
    }

    /* ── Search users API ── */
    public function handle_searchusers(Doku_Event $event, $param) {
        if (($_GET['do'] ?? '') !== 'searchusers') return;

        header('Content-Type: application/json');
        $q = strtolower(trim($_GET['q'] ?? ''));
        if (strlen($q) < 2) { echo json_encode([]); exit(); }

        global $auth;
        if (!$auth) { echo json_encode([]); exit(); }

        $allUsers = [];
        try {
            $byName  = $auth->retrieveUsers(0, 100, ['name' => '*' . $q . '*']) ?: [];
            $byLogin = $auth->retrieveUsers(0, 100, ['user' => '*' . $q . '*']) ?: [];
            $allUsers = array_merge($byName, $byLogin);
        } catch (Exception $e) {}

        if (empty($allUsers)) {
            try { $allUsers = $auth->retrieveUsers(0, 500) ?: []; } catch (Exception $e) {}
        }

        $results = [];
        $seen = [];
        foreach ($allUsers as $uname => $info) {
            if (isset($seen[$uname])) continue;
            $seen[$uname] = true;
            $displayName = $info['name'] ?? $uname;
            if (strpos(strtolower($uname), $q) === false &&
                strpos(strtolower($displayName), $q) === false) continue;

            $avatarUrl = '/wiki/lib/tpl/bootstrap3/images/avatar.png';
            if (file_exists(mediaFN('user:' . $uname . '.png'))) {
                $avatarUrl = '/wiki/lib/exe/fetch.php?media=user:' . urlencode($uname) . '.png';
            }
            $results[] = ['username' => $uname, 'displayName' => $displayName, 'avatar' => $avatarUrl];
        }

        echo json_encode($results);
        $event->preventDefault();
        exit();
    }

    /* ── JSON API ── */
    public function handle_userprofile_api(Doku_Event $event, $param) {
        $do = $_GET['do'] ?? '';

        /* GET profile data */
        if ($do === 'userprofile') {
            header('Content-Type: application/json');
            $username = $_GET['user'] ?? '';
            echo json_encode($this->get_profile_data($username));
            exit();
        }

        /* POST save banner */
        if ($do === 'savebanner' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');
            if (!isset($_SERVER['REMOTE_USER']) || !$_SERVER['REMOTE_USER']) {
                echo json_encode(['error' => 'Not logged in']);
                exit();
            }
            $username = $_SERVER['REMOTE_USER'];
            $input = json_decode(file_get_contents('php://input'), true);
            $type  = $input['type'] ?? '';
            $value = $input['value'] ?? '';

            if ($type === 'hero') {
                $this->save_user_meta($username, 'banner_hero', $value);
                $this->save_user_meta($username, 'banner_type', 'hero');
                echo json_encode(['ok' => true]);
            } elseif ($type === 'upload') {
                $dataUrl = $value;
                if (preg_match('/^data:image\/(\w+);base64,(.+)$/', $dataUrl, $m)) {
                    $imgData   = base64_decode($m[2]);
                    $mediaId   = 'user:' . $username . '_banner.png';
                    $mediaPath = mediaFN($mediaId);
                    $dir = dirname($mediaPath);
                    if (!is_dir($dir)) mkdir($dir, 0755, true);
                    file_put_contents($mediaPath, $imgData);
                    $this->save_user_meta($username, 'banner_type', 'upload');
                    echo json_encode(['ok' => true]);
                } else {
                    echo json_encode(['error' => 'Invalid image data']);
                }
            } else {
                echo json_encode(['error' => 'Invalid type']);
            }
            exit();
        }

        /* GET load banner */
        if ($do === 'loadbanner') {
            header('Content-Type: application/json');
            $username = $_GET['user'] ?? '';
            $type  = $this->load_user_meta($username, 'banner_type');
            $hero  = $this->load_user_meta($username, 'banner_hero');
            echo json_encode(['type' => $type, 'hero' => $hero]);
            exit();
        }

        /* POST save showcased guides */
        if ($do === 'saveshowcase' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');
            if (!isset($_SERVER['REMOTE_USER']) || !$_SERVER['REMOTE_USER']) {
                echo json_encode(['error' => 'Not logged in']); exit();
            }
            $username = $_SERVER['REMOTE_USER'];
            $input = json_decode(file_get_contents('php://input'), true);
            $ids = $input['ids'] ?? [];
            if (!is_array($ids)) { echo json_encode(['error' => 'Invalid data']); exit(); }
            $ids = array_slice(array_filter($ids, function($id) {
                return is_string($id) && strpos($id, 'guides:') === 0;
            }), 0, 6);
            $this->save_user_meta($username, 'showcase', json_encode($ids));
            echo json_encode(['ok' => true]);
            exit();
        }

        /* GET load showcased guides */
        if ($do === 'loadshowcase') {
            header('Content-Type: application/json');
            $username = $_GET['user'] ?? '';
            $raw = $this->load_user_meta($username, 'showcase');
            $ids = $raw ? json_decode($raw, true) : [];
            echo json_encode(['ids' => $ids ?: []]);
            exit();
        }

        /* POST save profile (avatar, bio, socials) */
        if ($do === 'saveprofile' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');
            if (!isset($_SERVER['REMOTE_USER']) || !$_SERVER['REMOTE_USER']) {
                echo json_encode(['error' => 'Not logged in']);
                exit();
            }
            $username = $_SERVER['REMOTE_USER'];
            $input = json_decode(file_get_contents('php://input'), true);
            $type  = $input['type']  ?? '';
            $value = $input['value'] ?? '';

            if ($type === 'avatar') {
                if (preg_match('/^data:image\/(\w+);base64,(.+)$/', $value, $m)) {
                    $imgData   = base64_decode($m[2]);
                    $mediaId   = 'user:' . $username . '.png';
                    $mediaPath = mediaFN($mediaId);
                    $dir = dirname($mediaPath);
                    if (!is_dir($dir)) mkdir($dir, 0755, true);
                    file_put_contents($mediaPath, $imgData);
                    echo json_encode(['ok' => true]);
                } else {
                    echo json_encode(['error' => 'Invalid image data']);
                }
            } elseif ($type === 'bio') {
                $bioDir  = DOKU_INC . 'data/pages/user/';
                if (!is_dir($bioDir)) mkdir($bioDir, 0755, true);
                $bioFile = $bioDir . $username . '.txt';
                $bio     = strip_tags(trim((string)$value));
                file_put_contents($bioFile, $bio);
                echo json_encode(['ok' => true]);
            } elseif ($type === 'socials') {
                if (!is_array($value)) {
                    echo json_encode(['error' => 'Invalid socials data']);
                    exit();
                }
                $allowed = ['steam','statlocker','discord','twitter','youtube','twitch'];
                foreach ($allowed as $k) {
                    $v = trim((string)($value[$k] ?? ''));
                    $this->save_user_meta($username, $k, $v);
                }
                echo json_encode(['ok' => true]);
            } else {
                echo json_encode(['error' => 'Invalid type']);
            }
            exit();
        }

        /* ══════════════════════════════════════════════
           POST upload media file
           Used by the WYSIWYG block editor for direct
           file uploads — saves to data/media/NAMESPACE/
           and returns a fetch.php URL.
        ══════════════════════════════════════════════ */
        if ($do === 'uploadmedia' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');

            /* Must be logged in */
            if (empty($_SERVER['REMOTE_USER'])) {
                echo json_encode(['ok' => false, 'error' => 'Not authenticated']);
                exit();
            }

            /* Validate upload */
            if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
                $code = $_FILES['file']['error'] ?? -1;
                echo json_encode(['ok' => false, 'error' => 'Upload error code ' . $code]);
                exit();
            }

            $file     = $_FILES['file'];
            $origName = basename($file['name']);

            /* Sanitise filename */
            $safeName = strtolower($origName);
            $safeName = preg_replace('/\s+/', '_', $safeName);
            $safeName = preg_replace('/[^a-z0-9_.\-]/', '', $safeName);
            if (!$safeName) {
                echo json_encode(['ok' => false, 'error' => 'Invalid filename']);
                exit();
            }

            /* Allowed extensions */
            $ext     = strtolower(pathinfo($safeName, PATHINFO_EXTENSION));
            $allowed = ['mp4', 'webm', 'mov', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
            if (!in_array($ext, $allowed)) {
                echo json_encode(['ok' => false, 'error' => 'File type not allowed: ' . $ext]);
                exit();
            }

            /* Namespace — JS sends "universaltech/cornerboosting" (slashes, not colons) */
            $rawNs   = trim($_POST['ns'] ?? 'wiki', '/ ');
            $rawNs   = preg_replace('/[^a-z0-9_\/\-]/', '', strtolower($rawNs));
            $nsPath  = $rawNs;                        // universaltech/cornerboosting
            $nsId    = str_replace('/', ':', $rawNs); // universaltech:cornerboosting

            /* Build destination inside data/media/ */
            $mediaBase = DOKU_INC . 'data/media/';
            $destDir   = $mediaBase . $nsPath . '/';
            $destFile  = $destDir . $safeName;

            if (!is_dir($destDir)) {
                if (!mkdir($destDir, 0755, true)) {
                    echo json_encode(['ok' => false, 'error' => 'Could not create directory: ' . $destDir]);
                    exit();
                }
            }

            if (!move_uploaded_file($file['tmp_name'], $destFile)) {
                echo json_encode(['ok' => false, 'error' => 'Failed to move uploaded file']);
                exit();
            }

            /* DokuWiki media ID and fetch URL */
            $mediaId  = $nsId . ':' . $safeName;
            $fetchUrl = '/wiki/lib/exe/fetch.php?media=' . rawurlencode($mediaId);

            echo json_encode([
                'ok'      => true,
                'url'     => $fetchUrl,
                'mediaId' => $mediaId,
                'name'    => $safeName,
            ]);
            exit();
        }
    }

    /* ── Profile display page intercept ── */
    public function handle_profile_page(Doku_Event $event, $param) {
        global $ID;
        if (strpos($ID, 'user:') !== 0) return;
        if ($event->data !== 'show') return;

        $tplFile = DOKU_INC . 'lib/tpl/bootstrap3/user/profile-display.html';
        if (!file_exists($tplFile)) return;

        $currentUser = $_SERVER['REMOTE_USER'] ?? '';
        $html = file_get_contents($tplFile);
        $html = str_replace('<body>', '<body data-user="' . htmlspecialchars($currentUser, ENT_QUOTES) . '">', $html);

        echo $html;
        $event->preventDefault();
        $event->stopPropagation();
    }

    /* ── Profile edit page intercept ── */
    public function handle_profile_edit_page(Doku_Event $event, $param) {
        if ($event->data !== 'profile') return;
        if ($_SERVER['REQUEST_METHOD'] === 'POST') return;

        $tplFile = DOKU_INC . 'lib/tpl/bootstrap3/user/profile-edit.html';
        if (!file_exists($tplFile)) return;

        global $auth;
        $username    = $_SERVER['REMOTE_USER'] ?? '';
        $userInfo    = ($auth && $username) ? $auth->getUserData($username) : [];
        $realname    = htmlspecialchars($userInfo['name'] ?? '', ENT_QUOTES);
        $email       = htmlspecialchars($userInfo['mail'] ?? '', ENT_QUOTES);
        $usernameEsc = htmlspecialchars($username, ENT_QUOTES);
        $sectok      = getSecurityToken();

        $html = file_get_contents($tplFile);
        $html = str_replace('__USERNAME__', $usernameEsc, $html);
        $html = str_replace('__REALNAME__', $realname,    $html);
        $html = str_replace('__EMAIL__',    $email,       $html);
        $html = str_replace('__SECTOK__',   $sectok,      $html);

        echo $html;
        $event->preventDefault();
        $event->stopPropagation();
    }

    /* ── Login page intercept ── */
    public function handle_login_page(Doku_Event $event, $param) {
        if ($event->data !== 'login') return;
        if ($_SERVER['REQUEST_METHOD'] === 'POST') return;

        $tplFile = DOKU_INC . 'lib/tpl/bootstrap3/user/login.html';
        if (!file_exists($tplFile)) return;

        global $ID;
        $sectok  = getSecurityToken();
        $pageId  = htmlspecialchars($ID ?? 'start', ENT_QUOTES);

        $msgArea = '';
        if (isset($_SESSION[DOKU_COOKIE]['msg']) && is_array($_SESSION[DOKU_COOKIE]['msg'])) {
            foreach ($_SESSION[DOKU_COOKIE]['msg'] as $msg) {
                if (!empty($msg['msg'])) {
                    $msgArea .= '<div class="auth-error">' . hsc($msg['msg']) . '</div>';
                }
            }
        }

        $html = file_get_contents($tplFile);
        $html = str_replace('__SECTOK__',  $sectok,  $html);
        $html = str_replace('__PAGE_ID__', $pageId,  $html);
        $html = str_replace('__ERROR__',   $msgArea, $html);

        echo $html;
        $event->preventDefault();
        $event->stopPropagation();
    }

    /* ── Register page intercept ── */
    public function handle_register_page(Doku_Event $event, $param) {
        if ($event->data !== 'register') return;
        if ($_SERVER['REQUEST_METHOD'] === 'POST') return;

        $tplFile = DOKU_INC . 'lib/tpl/bootstrap3/user/register.html';
        if (!file_exists($tplFile)) return;

        $sectok  = getSecurityToken();
        $msgArea = '';
        if (isset($_SESSION[DOKU_COOKIE]['msg']) && is_array($_SESSION[DOKU_COOKIE]['msg'])) {
            foreach ($_SESSION[DOKU_COOKIE]['msg'] as $msg) {
                if (!empty($msg['msg'])) {
                    $msgArea .= '<div class="auth-error">' . hsc($msg['msg']) . '</div>';
                }
            }
        }

        $html = file_get_contents($tplFile);
        $html = str_replace('__SECTOK__', $sectok,  $html);
        $html = str_replace('__ERROR__',  $msgArea, $html);

        echo $html;
        $event->preventDefault();
        $event->stopPropagation();
    }

    /* ── Helpers ── */
    private function get_profile_data($username) {
        if (!$username) return ['error' => 'No user specified'];

        global $auth;
        $userInfo = $auth ? $auth->getUserData($username) : null;
        if (!$userInfo) return ['error' => 'User not found'];

        $displayName = $userInfo['name'] ?? $username;
        $email       = $userInfo['mail'] ?? '';
        $groups      = $userInfo['grps'] ?? [];
        $role        = in_array('admin', $groups) ? 'Admin'
                     : (in_array('editor', $groups) ? 'Editor' : 'Member');

        $bioFile = DOKU_INC . 'data/pages/user/' . $username . '.txt';
        $bio = '';
        if (file_exists($bioFile)) {
            $raw = file_get_contents($bioFile);
            $raw = preg_replace('/<[^>]+>/', '', $raw);
            $bio = trim($raw);
        }

        $avatar = '/wiki/lib/tpl/bootstrap3/images/avatar.png';
        $avatarMedia = mediaFN('user:' . $username . '.png');
        if (file_exists($avatarMedia)) {
            $avatar = '/wiki/lib/exe/fetch.php?media=user:' . urlencode($username) . '.png';
        }

        $socials = [
            'steam'      => $this->load_user_meta($username, 'steam'),
            'statlocker' => $this->load_user_meta($username, 'statlocker'),
            'discord'    => $this->load_user_meta($username, 'discord'),
            'twitter'    => $this->load_user_meta($username, 'twitter'),
            'youtube'    => $this->load_user_meta($username, 'youtube'),
            'twitch'     => $this->load_user_meta($username, 'twitch'),
        ];
        $socials = array_filter($socials);

        $guides = [];
        $guidesDir = DOKU_INC . 'data/pages/guides/';
        if (is_dir($guidesDir)) {
            foreach (glob($guidesDir . '*.txt') as $f) {
                $content = file_get_contents($f);
                if (strpos($content, $username) === false) continue;
                $id    = 'guides:' . basename($f, '.txt');
                $title = $this->extract_title($content, $id);
                $guides[] = [
                    'id'      => $id,
                    'title'   => $title,
                    'tag'     => 'Guide',
                    'updated' => date('M j, Y', filemtime($f)),
                ];
            }
        }

        $edits     = [];
        $joined    = null;
        $editCount = 0;

        $savedJoined = $this->load_user_meta($username, 'joined');
        if ($savedJoined) $joined = $savedJoined;

        $changeLog = DOKU_INC . 'data/changes.log';
        if (file_exists($changeLog)) {
            $lines = file($changeLog, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            $userEdits = [];
            foreach ($lines as $line) {
                $parts = explode("\t", $line);
                if (count($parts) < 6) continue;
                if (trim($parts[4]) !== $username) continue;
                $userEdits[] = $parts;
            }
            if ($userEdits) {
                $changelogJoined = date('M j, Y', (int)$userEdits[0][0]);
                if (!$joined || (int)$userEdits[0][0] < strtotime('01 ' . $joined)) {
                    $joined = $changelogJoined;
                }
                $editCount = count($userEdits);
                foreach (array_reverse(array_slice($userEdits, -20)) as $e) {
                    $ts      = (int)$e[0];
                    $pageId  = $e[2];
                    $isGuide = strpos($pageId, 'guides:') === 0;
                    $edits[] = [
                        'id'      => $pageId,
                        'title'   => str_replace('_', ' ', basename(str_replace(':', '/', $pageId))),
                        'isGuide' => $isGuide,
                        'ago'     => $this->time_ago($ts),
                        'date'    => $ts,
                    ];
                }
            }
        }

        if (!$joined) {
            $usersFile = DOKU_INC . 'conf/users.auth.php';
            if (file_exists($usersFile)) {
                $lines      = file($usersFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                $totalUsers = 0;
                $userPos    = null;
                foreach ($lines as $line) {
                    if ($line[0] === '#') continue;
                    $parts = explode(':', $line, 2);
                    if (!isset($parts[0])) continue;
                    $totalUsers++;
                    if (trim($parts[0]) === $username) $userPos = $totalUsers;
                }
                if ($userPos !== null && $totalUsers > 0) {
                    $installDate  = strtotime('2024-01-01');
                    $span         = time() - $installDate;
                    $estimatedTs  = $installDate + ($span * ($userPos / max($totalUsers, 1)));
                    $joined       = date('M j, Y', (int)$estimatedTs);
                }
            }
        }

        if ($joined && !$savedJoined) {
            $this->save_user_meta($username, 'joined', $joined);
        }

        if (!$joined) $joined = 'Unknown';

        return [
            'username'    => $username,
            'displayName' => $displayName,
            'email'       => $email,
            'role'        => $role,
            'bio'         => $bio,
            'avatar'      => $avatar,
            'socials'     => $socials,
            'guides'      => $guides,
            'edits'       => $edits,
            'stats'       => [
                'guides' => count($guides),
                'edits'  => $editCount,
                'joined' => $joined,
            ],
        ];
    }

    private function save_user_meta($username, $key, $value) {
        $metaDir  = DOKU_INC . 'data/meta/users/';
        if (!is_dir($metaDir)) mkdir($metaDir, 0755, true);
        $metaFile = $metaDir . $username . '.json';
        $meta = [];
        if (file_exists($metaFile)) {
            $meta = json_decode(file_get_contents($metaFile), true) ?: [];
        }
        $meta[$key] = $value;
        file_put_contents($metaFile, json_encode($meta));
    }

    private function load_user_meta($username, $key) {
        $metaFile = DOKU_INC . 'data/meta/users/' . $username . '.json';
        if (!file_exists($metaFile)) return '';
        $meta = json_decode(file_get_contents($metaFile), true) ?: [];
        return $meta[$key] ?? '';
    }

    private function extract_title($content, $fallback) {
        if (preg_match('/^={2,6}(.+?)={2,6}/m', $content, $m)) {
            return trim($m[1]);
        }
        return str_replace(['guides:', '_'], ['', ' '], $fallback);
    }

    private function time_ago($ts) {
        $diff = time() - $ts;
        if ($diff < 60)     return 'just now';
        if ($diff < 3600)   return floor($diff/60) . 'm ago';
        if ($diff < 86400)  return floor($diff/3600) . 'h ago';
        if ($diff < 604800) return floor($diff/86400) . 'd ago';
        return date('M j, Y', $ts);
    }
}