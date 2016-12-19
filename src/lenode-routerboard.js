var maxBps = 20 * 1024 * 1024;
var refreshTime = 1;
var averageCount = 10;

var warningStartRatio = 0.75;
var fontColor = "#FFF";

var chartData = {};
var chartLabel = "";
var avgBpsArray = [];
var rtBps = 0;
var leftBps = maxBps;

var ctx = $('#traffic');
var trafficChart;

function drawChart() {
    //Call a function to redraw other content (texts, images etc)
    trafficChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [
                "Used bandwidth",
                "Unused bandwidth"
            ],
            datasets: [
                {
                    data: [rtBps, leftBps],
                    borderWidth: [0, 0],
                    backgroundColor: [
                        "#66abcc",
                        "#666666"
                    ]
                }
            ]
        },
        options: {
            cutoutPercentage: 90,
            responsive: true,
            legend: {
                display: true
            },
            title: {
                display: true,
                text: 'Download speed @ Le Node',
                fontSize: 30,
                fontColor: '#FFF'
            },
            animation: {
                // animateRotate: false
                easing: 'easeInQuad',
                duration: refreshTime * 1400
            }
        }
    });
    $('.donut-inner h5').html(chartLabel);
}

var GetChartData = function () {
    $.ajax({
        url: "./index.php?output=json",
        method: 'GET',
        dataType: 'json',
        success: function (d) {
            var rtBps = Math.min(maxBps, d.avgBps[0]);

            avgBpsArray.push(rtBps);
            avgBpsArray = avgBpsArray.slice(-averageCount); // Last `averageCount` measures

            avgBps = avgBpsArray.reduce(function(a, c) {
                return a+c;
            }) / avgBpsArray.length;

            // console.log(rtBps + ", " + avgBps);
            warningStartBps = warningStartRatio * maxBps;
            if (avgBps > warningStartBps) {
                ratio = (avgBps - warningStartBps) / (maxBps - warningStartBps);
                color = "#" + getColorForRatio(ratio);
                trafficChart.data.datasets[0].backgroundColor[0] = color;
            }

            var leftBps = maxBps - avgBps;
            chartLabel = "↓ " + (Math.round(avgBps / 1024 / 1024 * 10) / 10) + " Mb/s";
            trafficChart.data.datasets[0].data = [avgBps, leftBps];
            trafficChart.update();

            setTimeout(GetChartData, refreshTime * 1000);
        }
    });
};

$(document).ready(function() {
    drawChart();
    GetChartData();
});

function getColorForRatio(ratio) {
    var nodeBlue = "66ABCC";
    var aquinumRed = "E65A50";

    var color1 = aquinumRed;
    var color2 = nodeBlue;

    var hex = function(x) {
        x = x.toString(16);
        return (x.length == 1) ? '0' + x : x;
    };

    var r = Math.ceil(parseInt(color1.substring(0,2), 16) * ratio + parseInt(color2.substring(0,2), 16) * (1-ratio));
    var g = Math.ceil(parseInt(color1.substring(2,4), 16) * ratio + parseInt(color2.substring(2,4), 16) * (1-ratio));
    var b = Math.ceil(parseInt(color1.substring(4,6), 16) * ratio + parseInt(color2.substring(4,6), 16) * (1-ratio));

    var middle = hex(r) + hex(g) + hex(b);

    return middle;
}

//////// http://stackoverflow.com/a/34947440

Chart.pluginService.register({
  beforeDraw: function(chart) {
    var width = chart.chart.width,
        height = chart.chart.height,
        ctx = chart.chart.ctx;

    ctx.restore();
    var fontSize = (height / 150).toFixed(2);
    ctx.font = fontSize + "em sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillStyle = fontColor;

    var text = chartLabel,
        textX = Math.round((width - ctx.measureText(text).width) / 2),
        textY = height / 2 + chart.titleBlock.height;

    ctx.fillText(text, textX, textY);
    ctx.save();
  }
});
