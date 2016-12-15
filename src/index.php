<?php

session_start();

require('vendor/autoload.php');

const INTERFACE_INTERNET = 0;
const INTERFACE_LAN = 1;

$module = $_GET['module'];
$API = new RouterosAPI();

$routeros_ip = $_ENV["ROUTEROS_IP"];
$routeros_username = $_ENV["ROUTEROS_USERNAME"];
$routeros_password = $_ENV["ROUTEROS_PASSWORD"];

if ($API->connect($routeros_ip, $routeros_username, $routeros_password)) {
    $_SESSION['api'] = serialize($API);
}

$API->write('/interface/print');
$READ = $API->read(false);
$response = $API->parseResponse($READ);

$diffRxByte = [];
$avgBps = [];
$elapsedTime = time() - $_SESSION['lastCheck'];
if ($elapsedTime === 0) {
    $elapsedTime = 1;
}
foreach ($response as $key => $interface) {
    $diffRxByte[$key] = round($interface['rx-byte'] - $_SESSION['rx-byte'][$key]);
    $avgBps[$key] = round($diffRxByte[$key] * 8 / $elapsedTime);
    $_SESSION['rx-byte'][$key] = $interface['rx-byte'];
    $_SESSION['lastCheck'] = time();
}

if($_GET["output"] === "json") {
    header('Content-type:application/json;charset=utf-8');
    echo json_encode(
        array(
            "avgBps" => $avgBps,
            "diffRxByte" => $diffRxByte,
            "elapsedTime" => $elapsedTime
        )
    );

    exit;
}

?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title></title>
        <link rel="stylesheet" type="text/css" href="lenode-routerboard.css">

    </head>
    <body>

    <canvas id="traffic"></canvas>

    <script src="node_modules/jquery/dist/jquery.min.js"></script>
    <script src="node_modules/chart.js/dist/Chart.min.js"></script>
    <script src="lenode-routerboard.js"></script>

    </body>
</html>
