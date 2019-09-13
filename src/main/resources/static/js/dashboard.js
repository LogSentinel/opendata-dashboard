var searchPageSize = 30;
var currentSearchPage = 0;
var currentPageSize = searchPageSize;
var endPeriodIsNow = true;
var stopLiveUpdates = false;
var userTimezone = "UTC";
var shouldIgnoreHistogram = false;
var chartColors = ["#6c96b2","#26B99A","#cacaca","#9b9b9b","#70aaa3","#6c96b2","#26B97A","#cacaca","#9b9b9b","#70aaa3"];
var anomalyColor = "#DC143C";
var currentSearchString="";


$(document).ready(function () {
    // needed for Flot

    userTimezone = $("#userTimezone").val();

   // $("#searchTabs").tabs();

    // configureTimePicker();
    var startDate=""
    var endDate=""
    if($("#daterange").val()==""){
        startDate=moment().subtract("1","days")
        endDate=moment()
    }else{
        startDate=$("#daterange").val().split(" - ")[0]
        endDate=$("#daterange").val().split(" - ")[1]
    }

    $('input[name="daterange"]').daterangepicker({
        startDate:startDate,
        endDate:endDate
    });
    configureSearchButton();
});

function liveUpdates(){
    if (!stopLiveUpdates) {
        configureTimePicker();
        populateHistogram();
        shouldIgnoreHistogram = true;
        performSearch(0);
        shouldIgnoreHistogram = false;
    }
}

function populateStatistics(initial) {
    var range;
    if (initial) {
        range = "";
    } else {
        range = "?start=" + $("#reportrange").data("daterangepicker").startDate
            + "&end=" + $("#reportrange").data("daterangepicker").endDate;
    }
    $.ajax({
        url: "/statistics" + range,
        type: "GET",
        success: function(data) {
            // top of the page totals
            $("#stats-entries").html(data.logEntries);
            $("#stats-actors").html(data.actors);
            $("#stats-actions").html(data.actionTypes);
            $("#stats-applications").html(data.applications);
            if (data.alerts > 0){
                $("#stats-alerts").html('<a style="color:red" href="/alerts/runs">' + data.alerts+'</a>');
            } else {
                $("#stats-alerts").html('<a style="color:#73879C" href="/alerts/runs">' + data.alerts+'</a>');
            }

            // charts
            $("#topActorsChart").data("labels", data.topActorsLabels.join(","));
            $("#topActionsChart").data("labels", data.topActionsLabels.join(","));
            $("#topEntitiesChart").data("labels", data.topEntitiesLabels.join(","));
            $("#topApplicationsChart").data("labels", data.topApplicationsLabels.join(","));

            $("#topActorsChart").data("chart-data", data.topActorsData.join(","));
            $("#topActionsChart").data("chart-data", data.topActionsData.join(","));
            $("#topEntitiesChart").data("chart-data", data.topEntitiesData.join(","));
            $("#topApplicationsChart").data("chart-data", data.topApplicationsData.join(","));

            fillTable("#topActorsTable", data.topActorsLabels, data.topActorsData, "fa-user", "searchActorDisplayName");
            fillTable("#topActionsTable", data.topActionsLabels, data.topActionsData, "fa-hand-pointer-o", "searchAction");
            fillTable("#topEntitiesTable", data.topEntitiesLabels, data.topEntitiesData, "fa-file-text-o", "searchEntityType");
            fillTable("#topApplicationsTable", data.topApplicationsLabels, data.topApplicationsData, "");

            initCharts();
        }
    });
}

function fillTable(table, labels, data, icon, fn) {
    for (var i = 0; i < labels.length; i++) {
        $(table + " tbody").append('<tr>' +
            '<td scope="row">' + (i + 1) + '</td>' +
            '<td class="side-content-column">' +
            (fn != null ?  '<a class="pull-left border-aero" href="javascript' + fn + '(\'' + labels[i] + '\')"><i class="fa ' + icon + ' aero"></i>&nbsp;' : '') +
            sanitize(labels[i]) + (fn != null ? '</a>' : '') + '</td>' +
            '<td>' + data[i] + '</td></tr>');
    }
}
function populateHistogram(){
    var query = $("#searchBox").val();
    if(!query){
        query = "*:*";
    }
    $.ajax({
        url: "localhost:8080/statistics/histogram?start=" + $("#reportrange").data("daterangepicker").startDate
            + "&end=" + $("#reportrange").data("daterangepicker").endDate + "&period=1h"
            + "&query=" + encodeURIComponent(replaceSlash(query)),
        type: "GET",
        success: function (data) {
            setHistogramData(data);
        }
    });

}

function initCharts(){
    clearChart($("#topActorsChart"));
    clearChart($("#topActionsChart"));
    clearChart($("#topEntitiesChart"));
    clearChart($("#topApplicationsChart"));
    initHorizontalBarChart("#topActorsChart", true);
    initDoughnutChart("#topActionsChart", true);
    initDoughnutChart("#topEntitiesChart", true);
    initDoughnutChart("#topApplicationsChart", true);

    $("<div id='histogram-tooltip'></div>").css({
        position: "absolute",
        display: "none",
        color: "white",
        border: "1px solid #fdd",
        padding: "2px",
        "background-color": "#285e8e"
    }).appendTo("body");
}

function initCustomCharts(){
    $(".customChart").each(function(){
        var canvas = $(this);
        clearChart(canvas);
        var chartId = canvas.attr("id");
        var startDate = $("#reportrange").data("daterangepicker").startDate;
        var endDate = $("#reportrange").data("daterangepicker").endDate;
        $.ajax({
            url: "/charts/data/" + chartId + "?start=" + startDate + "&end="+endDate,
            type: "GET",
            success: function (data) {
                var colors = chartColors;
                if (data.colors)  {
                    colors = data.colors.concat(chartColors);
                }

                var settings = {
                    type: data.type,
                    tooltipFillColor: "rgba(51, 51, 51, 0.55)",
                    data: {
                        labels: data.labels,
                        datasets: [{
                            data: data.values,
                            backgroundColor: colors,
                            fill:false
                        }],

                    },
                    options: {
                        legend: {
                            display: false
                        },
                        responsive: true,
                    }
                }
                if (data.type == 'line') {
                    settings.data.datasets[0].borderColor = colors[0];
                    settings.data.datasets[0].pointBackgroundColor = colors[0];
                }
                if (data.type == 'anomaly') {
                    settings.type = 'line';
                    settings.data.datasets[0].borderColor = anomalyColor;
                    settings.data.datasets[0].pointBackgroundColor = anomalyColor;
                }
                var chart = new Chart(canvas, settings);
                canvas.data("chart-id", chart.id);
            }
        });
    });
}

function formatNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function toTimezone(time, zone) {
    var format = 'DD.MM.YYYY HH:mm:ss';
    return moment.utc(time).tz(zone).format(format);
}

function configureSearchButton() {

    $("#searchButton").click(function () {
        search();
    });

    $("#searchBox").keypress(function(e) {
    });

    $("#nextPageButton").click(function () {
        // if (currentPageSize < searchPageSize) {
        //     $.notify("There are no more results", "info");
        //     return;
        // }
        // performSearch(currentSearchPage + 1);
        // currentSearchPage++;
    });

    $("#previousPageButton").click(function () {
        // if (currentSearchPage >= 1) {
        //     performSearch(currentSearchPage - 1);
        //     currentSearchPage--;
        // }
    });
}

function previousSearch(id) {
    $("#searchBox").val("id:" +id );
    performSearchWithPeriod(0, 0, new Date().getTime());
}

function configureApplicationForSearch() {
    $("#applicationId").change(function () {
        if (this.value == "all") {
            var query = $("#searchBox").val();
            query = query.replace(new RegExp("AND applicationId:[a-zA-Z0-9-]+", "g"), "");
            query = query.replace(new RegExp("applicationId:[a-zA-Z0-9-]+", "g"), "");
            $("#searchBox").val(query);
        } else {
            appendToSearchQuery("applicationId:" + this.value);
        }
    });

    $("#applicationIdAgg").change(function () {
        performAggregation();
    });

    $("#aggFunctions").change(function () {
        performNumericAggregation();
    });

    $("#aggField").change(function () {
        performNumericAggregation();
    });
    $("#applicationIdNumericAgg").change(function () {
        performNumericAggregation();
    });
}

function performAggregation() {
    var startDate = $("#searchrangeAgg").data("daterangepicker").startDate;
    var endDate = $("#searchrangeAgg").data("daterangepicker").endDate;
    var period = $("#periodInput").val();
    var applicationId = $("#applicationIdAgg").val();
    if (applicationId === 'all') {
        applicationId = "";
    }

    if (period === 'hour') {
        if ((endDate - startDate) / (1000 * 60 * 60) > 750) {
            showDialog("manyRowsWarning");
            return;
        }
    }

    // reset aggregation charts
    $("#aggregationCharts").hide();
    $("#aggregationCharts").appendTo("body");

    $.ajax({
        url: "/search/intervals?start=" + startDate + "&end=" + endDate + "&interval=" + period + "&applicationId=" + applicationId,
        type: "GET",
        success: function (data) {
            currentPageSize = data.length;
            $("#searchResultsAgg tbody").find("tr").remove();
            $.each(data, function (idx, entry) {
                $("#searchResultsAgg tbody").append(
                    '<tr><td>' + entry.period + '</td>' +
                    '<td>' + entry.periodName + '</td>' +
                    '<td>' + entry.count + '</td>' +
                    '<td><button id="charts' + entry.key +
                    '" type="button" class="search-helper btn btn-dark" onclick="showChartDialog('+entry.key+',\''+entry.period+'\', this)">Show charts</button></td>' +
                    '</tr><tr><td colspan="4"></td></tr>')
            });
        }
    });

}

function performNumericAggregation() {
    var startDate = $("#searchrangeNumericAgg").data("daterangepicker").startDate;
    var endDate = $("#searchrangeNumericAgg").data("daterangepicker").endDate;
    var func = $("#aggFunctions").val();
    var field = $("#aggField").val();
    var applicationId = $("#applicationIdNumericAgg").val();
    if (applicationId === 'all') {
        applicationId = "";
    }

    $.ajax({
        url: "/search/numericAgg?start=" + startDate + "&end=" + endDate + "&function=" + func + "&field=" + field + "&applicationId=" + applicationId,
        type: "GET",
        success: function (data) {
            $("#aggValue").text(data);
            $("#aggTitle").text(func + "(" + field + ")");
        }
    });
}

function performSearch(page) {
    var startDate = $("#searchrange").data("daterangepicker").startDate;
    var endDate = $("#searchrange").data("daterangepicker").endDate;
    performSearchWithPeriod(page, startDate, endDate);
    // preformSearchWithPeriodNew(page, startDate, endDate);
}

function search(){
    var query="/"

    var keyWord=jsEscape($("#searchInput").val().trim())

    startDate = new Date($("#daterange").val().split(" - ")[0]).getTime();
    endDate = new Date($("#daterange").val().split(" - ")[1]).getTime();

    if(isNaN(startDate)||isNaN(endDate)) {
        startDate = "";
        endDate = "";
    }

    var params=[];

    if(keyWord!=="")
    params.push("keyWord="+keyWord);
    if(startDate!=="")
    params.push("start="+startDate);
    if(endDate!=="")
    params.push("end="+endDate);

    if(params.length>0){
        query+="?"+params.join("&")
    }
        location.href=query
}

function performSearchWithPeriod(page, startDate, endDate) {

    if(endPeriodIsNow){
        endDate = moment();
    }
    var query = $("#searchBox").val();
    var encryptionKey = $("#encryptionKey").val();
    if (query == "") {
        query = "*:*";
        doPerformSearch(query, startDate, endDate, page, searchPageSize);
    }
    else {
        prepareEncryptedQuery(query).then(function(preparedQuery) {
            doPerformSearch(preparedQuery, startDate, endDate, page, searchPageSize)
        });
    }

    // when the trigger of search is click on the histogram graph, don't populate it again
    if(!shouldIgnoreHistogram){
        populateHistogram();
    }

}

function doPerformSearch(query, startDate, endDate, page, searchPageSize){
    $.ajax({
        url: "/search?query=" + encodeURIComponent(replaceSlash(query)) + "&start=" + startDate + "&end=" + endDate + "&page=" + page + "&pageSize=" + searchPageSize,
        type: "GET",
        success: function (data) {
            $(".tableexport-caption").remove();
            populateSearchResult(data);
            $("#searchResults").tableExport({position: 'top', ignoreCols: [3, 6, 7]});
            $("#searchResults .tableexport-caption").append('<button type="button" id="visualizeGraph" onclick="showDialog(\'graphContainer\', 900, 650); initGraphVisuzliation ();" class="btn btn-success">' + i18Visualize + '</button>');
        }
    });
}

function performSavedSearch(savedSearchId){

    $.get("/search/saved?savedSearchId=" + savedSearchId, function(result) {
        $("#searchBox").val(jsEscape(result.query));
    });

    $.ajax({
        url: "/search/bySavedSearch?savedSearchId=" + savedSearchId,
        type: "GET",
        success: function (data) {
            $(".tableexport-caption").remove();
            populateSearchResult(data);
            $("#searchResults").tableExport({position: 'top'});
        },
    });
}

function populateSearchResult(data){

    currentPageSize = data.length;
    $("#searchResults tbody").find("tr").remove();
    $.each(data, function (idx, entry) {
        var roles = "";
        $.each(entry.actorRoles, function (idx, role) {
            var escapedRole = jsEscape(role);
            roles += '&nbsp;(<a href="javascript:searchActorRole(\'' + escapedRole + '\')">' + escapedRole + '</a>)';
        });
        var entryDetails = entry.details ? entry.details : '';
        if (typeof(entryDetails) === 'object') {
            entryDetails = JSON.stringify(entryDetails);
        }

        var binaryContent = entry.additionalParams ? entry.additionalParams.binaryContent : false;
        var detailsTD;
        if (binaryContent) {
            detailsTD = '<td><a target="_blank" href="/binaryDownload/'+ entry.id +'">Download binary content</a></td>';
        } else {
            var escapedDetails = jsEscape(entryDetails);
            detailsTD = '<td class="target" onclick="showDetails(\'' + escapedDetails + '\', \'' + jsEscape(entry.action) + '\',\'' + jsEscape(entry.entryType) + '\',\'' + jsEscape(entry.applicationId) + '\',' + ( entry.encryptedKeywordsList != null &&  entry.encryptedKeywordsList !== undefined &&  entry.encryptedKeywordsList.length > 0) + ')"><code class="entryDetails' +((entry.encryptedKeywordsList) ?' encrypted':'') +'" data-appid="' + entry.applicationId + '">' + (entry.encryptedKeywordsList? 'Encrypted! Click to decrypt' : abbreviateAndEscape(entry.details, 100)) + '</code></td>'
        }


        $("#searchResults tbody").append('<tr><td class="tableexport-string target datatable-column"><a class="pull-left border-aero profile_thumb" ' +
            'href="javascript:searchActor(\'' + trimValue(jsEscape(entry.actorId)) + '\')"><i class="fa fa-user aero"></i> ' +
            (entry.actorDisplayName == null ? trimValue(htmlEscape(entry.actorId)) : htmlEscape(entry.actorDisplayName)) + '</a>' + roles + '</td>' +
            '<td class="tableexport-string target datatable-column"><a href="javascript:searchAction(\'' + trimValue(jsEscape(entry.action)) + '\')">' + trimValue(htmlEscape(entry.action)) + '</a></td>' +
            '<td class="tableexport-string target datatable-column"><a href="javascript:searchEntityType(\'' + trimValue(jsEscape(entry.entityType)) + '\')">' + trimValue(htmlEscape(entry.entityType)) + '</a> #<a href="javascript:searchEntityId(\'' + trimValue(htmlEscape(entry.entityId)) + '\', \'' + trimValue(htmlEscape(entry.entityType)) + '\')">' + trimValue(htmlEscape(entry.entityId)) + '</a></td>' +
            detailsTD +
            '<td class="tableexport-string target datatable-column"' + ((entry.logLevel == 'ERROR' || entry.logLevel == 'CRITICAL' || entry.logLevel == 'FATAL') ? ' style="color:red"' : '') + '>' + (entry.logLevel ? entry.logLevel : '') + '</td>' +
            '<td class="tableexport-string target datatable-column">' + toTimezone(entry.timestamp, userTimezone) + '&nbsp;<a title="Token info" href="javascript:showTokenInfo(\'' + entry.id + '\');"><i class="fa fa-clock-o"></i></a></td>' +
            '<td class="target datatable-column hidden-xs"><a href="javascript:showParams(\'' + jsEscape(JSON.stringify(entry.additionalParams)) + '\');"><i class="fa fa-list-ul"></i></a></td>' +
            '<td class="target datatable-column hidden-xs"><a href="javascript:showHash(\'' + entry.hash + '\',\'' + entry.id + '\', \'' + entry.standaloneHash + '\',\'' + entry.applicationId + '\',\'' + entry.previousEntryId + '\');"><i class="fa fa-chain"></i></a></td>' +
            '<td class="tableexport-string target datatable-column" style="display: none;">' + htmlEscape(queryExcerpt()) + '</td>' +
            '<td class="tableexport-string target datatable-column" style="display: none;">' + htmlEscape(entry.details) + '</td>' +
            '<td class="tableexport-string target datatable-column" style="display: none;">' + entry.hash + '</td></tr>');
    });
}

function replaceSlash(query) {
    return query.split("/").join("\\/")
}

function prepareEncryptedQuery(query) {
    $("#encryptionKey").attr('style', '');
    var encryptionKey = $("#encryptionKey").val();
    if(!encryptionKey || encryptionKey === ""){
        return Promise.all([]).then(function() {return query;});
    }
    if(query.includes(":") ){
        if(query.includes("details:") && !query.includes("details:*")){
            var detailsPart = query.substring(query.indexOf("details:") + 8);
            detailsPart = detailsPart.trim().split(" ")[0];
            var encryptPromise = aesEncryptKeyWords( detailsPart, encryptionKey );
            return encryptPromise.then(function(result){
                query = query.concat(" or encryptedKeywordsList:" + result);
                return query;
            })
                .catch(function(err){
                    $("#encryptionKey").attr('style', 'color:red');
                    console.error(err);
                });
        }
    }
    else{
        var words = query.trim().split(" ");
        var promises = [];
        words.forEach(function(word){
            promises.push(
                aesEncryptKeyWords( word, encryptionKey ).then(function(encrypted) {
                    query = query.concat(" or encryptedKeywordsList:"+encrypted);
                })
            )
        });
        return Promise.all(promises).then(function() {
            return query;
        })
            .catch(function(err){
                $("#encryptionKey").attr('style', 'color:red');
                console.error(err);
            });
    }
    return Promise.all([]).then(function() {return query;});
}

function trimValue(val) {
    if (val === undefined) {
        return '';
    }
    return val;
}

function configureSearchHelp() {
    $(".search-helper").click(function () {
        var toAppend = $(this).html();
        appendToSearchQuery(toAppend);
    });

    $(".search-period").click(function () {
        var period = $(this).data("period");
        $("#periodInput").val(period);
        performAggregation();
    });

    $(".search-help").click(function () {
        showDialog("helpDialog");
    });

    $(".search-help-encrypt").click(function () {
        showDialog("helpEncryptDialog");
    });
}

function showDialog(id, width, height) {
    $("#" + id).dialog({
        width:width,
        height: height,
        modal: true, open: function (event, ui) {
            $('.ui-widget-overlay').bind('click', function () {
                $(this).siblings('.ui-dialog').find('.ui-dialog-content').dialog('close');
            });
        }
    });
}

function showChartDialog(start, period, button) {
    var end = getEnd(start, period);
    var applicationId = $("#applicationIdAgg").val();
    if (applicationId === 'all') {
        applicationId = "";
    }
    $.ajax({
        url: "/statistics?applicationId=" + applicationId + "&start=" + start + "&end=" + end,
        type: "GET",
        success: function (data) {

            $("#topActorsChartAggregated").data("labels", data.topActorsLabels.join(','));
            $("#topActorsChartAggregated").data("chart-data", data.topActorsData.join(','));
            clearChart($("#topActorsChartAggregated"));
            initHorizontalBarChart("#topActorsChartAggregated", false);

            $("#topActionsChartAggregated").data("labels", data.topActionsLabels.join(','));
            $("#topActionsChartAggregated").data("chart-data", data.topActionsData.join(','));
            clearChart($("#topActionsChartAggregated"))
            initDoughnutChart("#topActionsChartAggregated", false);

            $("#topEntitiesChartAggregated").data("labels", data.topEntitiesLabels.join(','));
            $("#topEntitiesChartAggregated").data("chart-data", data.topEntitiesData.join(','));
            clearChart($("#topEntitiesChartAggregated"))
            initDoughnutChart("#topEntitiesChartAggregated", false);

            $("#topApplicationsChartAggregated").data("labels", data.topApplicationsLabels.join(','));
            $("#topApplicationsChartAggregated").data("chart-data", data.topApplicationsData.join(','));
            clearChart($("#topApplicationsChartAggregated"));
            initDoughnutChart("#topApplicationsChartAggregated", false);
        }
    });

    // each row has an empty colspanned row below it - we find the <tr> and then its first <td> tp append to
    $("#aggregationCharts").appendTo($(button).parent().parent().next().children().first());
    $("#aggregationCharts").show();
}

function clearChart(target) {
    // if( target.data("chart-id")) returns false when target.data("chart-id") is 0
    if (target.data("chart-id") != null && target.data("chart-id") != 'undefined') {
        Chart.instances[target.data("chart-id")].destroy();
    }
}

function getEnd(start, period){
    var date = new Date(start);
    if(period.toLowerCase() === 'hour'){
        return date.addHours(1).getTime().toString()
    }
    if(period.toLowerCase() === 'day'){
        return date.addDays(1).getTime().toString()
    }
    if(period.toLowerCase() === 'week'){
        return date.addWeeks(1).getTime().toString()
    }
    if(period.toLowerCase() === 'month'){
        return date.addMonths(1).getTime().toString()
    }
    if(period.toLowerCase() === 'year'){
        return date.addYears(1).getTime().toString()
    }
}

function appendToSearchQuery(toAppend) {
    var searchbox = $("#searchBox");
    var currentQuery = searchbox.val();
    var linker = " AND ";
    if (currentQuery == "") {
        linker = "";
    }
    searchbox.val(currentQuery + linker + toAppend);
}

function searchActor(actorId) {
    doSearch('actorId:"' + escapeQuotes(actorId) + '"');
}

function searchActorDisplayName(actor) {
    doSearch('actorDisplayName:"' + escapeQuotes(actor) + '"');
}

function searchActorRole(actorRole) {
    doSearch('actorRoles:"' + escapeQuotes(actorRole) + '"');
}

function searchAction(action) {
    doSearch('action:"' + escapeQuotes(action) + '"');
}

function searchEntityType(entityType) {
    doSearch('entityType:"' + escapeQuotes(entityType) + '"');
}

function searchEntityId(entityId, entityType) {
    doSearch('entityId:"' + entityId + '" AND entityType:"' + entityType + '"');
}

function escapeQuotes(query){
    return query.replace(/"/g, "\\\"");
}

function doSearch(query) {
    $("#searchBox").val(query);
    $("#searchButton").click();
    // $("html, body").animate({
    //     scrollTop: $("#searchButton").offset().top
    // }, 200);
}

function showDetails(details, action, entryType, appId, encrypted) {
    var encryptionKey = $("#encryptionKey").val();
    var decrypted;
    if (encrypted && encryptionKey) {
        decrypt = aesDecrypt( details, encryptionKey );
        decrypt.then(function(result){
            //offset is needed because of encryption with static IV and random first block
            doShowDetails(result, action, entryType, appId);
        });
    } else {
        doShowDetails(details, action, entryType, appId, encrypted)
    }
}

function doShowDetails(details, action, entryType, appId) {
    $("#encryptionKey").attr('style', '');
    $('<div />').css("word-break", "break-all").html(nl2br(transformDetails(unescapeString(details), appId))).dialog({
        width: "300px;",
        modal: true,
        title: action + " (" + entryType + ")",
        open: function (event, ui) {
            $('.ui-widget-overlay').bind('click', function () {
                $(this).siblings('.ui-dialog').find('.ui-dialog-content').dialog('close');
            });
        }
    })
}


function showTokenInfo(id) {
    $.get("/timestampInfo?id=" + id, function (response) {
        var html = "<strong>Timestamp token details</strong><table style=\"max-width: 800px;\">";
        for (var key in response) {
            if (response.hasOwnProperty(key)) {
                html += "<tr><td><strong>" + key + "</strong>&nbsp;</td><td style=\"word-break: break-all;\">" + response[key] + "</td></tr>";
            }
        }
        html += "</table>";
        $('<div />').html(html).dialog({
            width: "300px;",
            modal: true,
            open: function (event, ui) {
                $('.ui-widget-overlay').bind('click', function () {
                    $(this).siblings('.ui-dialog').find('.ui-dialog-content').dialog('close');
                });
            }
        });
    });
}

function unescapeString(str) {
    var r = /\\u([\d\w]{4})/gi;
    str = str.replace(r, function (match, grp) {
        return String.fromCharCode(parseInt(grp, 16));
    });
    str = unescape(str);
    return str;
}

function setHistogramData(data) {
    var options = {
        series: {
            lines: {
                show: true,
                fill: true,
                tension: 0.4,
                lineWidth: 1,
                fill: 0.4
            },
            splines: {
                show: false
            },
            points: {
                //radius: 1.5,
                show: false
            },
            shadowSize: 2
        },
        grid: {
            verticalLines: false,
            hoverable: true,
            clickable: true,
            //tickColor: "#d5d5d5",
            borderWidth: 1,
            color: '#fff',
        },
        //colors: ["rgba(38, 185, 154, 0.38)"],
        colors: ["rgba(108, 150, 178, 0.8)"],
        xaxis: {
            tickColor: "rgba(51, 51, 51, 0.06)",
            mode: "time",
            minTickSize: [1, "hour"],
            timeformat: "%d.%m %H:%M",
            timezone: userTimezone,
            axisLabel: "Date",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 10
        },
        yaxis: {
            ticks: 5,
            tickColor: "rgba(51, 51, 51, 0.06)",
        },
        tooltip: true,
        selection: {
            mode: "xy"
        }
    }
    var histogram = $.plot($("#histogram"), [data], options);

    $("#histogram").bind("plothover", function (event, pos, item) {
        if (item) {
            var timestamp = parseInt(item.datapoint);
            var date = moment.utc(timestamp).tz(userTimezone);
            $("#histogram-tooltip").html(date.format("MMMM D, YYYY HH:mm"))
                .css({top: item.pageY+5, left: item.pageX+5})
                .fadeIn(200);
        } else {
            $("#histogram-tooltip").hide();
        }
    });

    $("#histogram").bind("plotselected", function (event, ranges) {
        // clamp the zooming to prevent eternal zoom

        if (ranges.xaxis.to - ranges.xaxis.from < 1) {
            ranges.xaxis.to = ranges.xaxis.from + 1;
        }

        if (ranges.yaxis.to - ranges.yaxis.from < 1) {
            ranges.yaxis.to = ranges.yaxis.from + 1;
        }

        // do the zooming

        histogram = $.plot("#histogram", [data],
            $.extend(true, {}, options, {
                xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to },
                yaxis: { min: ranges.yaxis.from, max: ranges.yaxis.to }
            })
        );

        var startTimestamp = parseInt(ranges.xaxis.from);
        var endTimestamp = parseInt(ranges.xaxis.to);
        var start = moment.utc(startTimestamp).tz(userTimezone);
        var end = moment.utc(endTimestamp).tz(userTimezone);
        $("#searchrange").data("daterangepicker").setStartDate(start);
        $("#searchrange").data("daterangepicker").setEndDate(end);

        $('#searchrange span').html(
            start.format('MMMM D, YYYY')
            + ' - '
            + end.format('MMMM D, YYYY'));

        triggerSearch();
        stopLiveUpdates = true;
        $('#resetHistogram').removeAttr("hidden");

    });

    $("#histogram").bind("plotclick", function (event, pos, item) {
        if (item) {
            var timestamp = parseInt(item.datapoint);
            var start = moment.utc(timestamp).tz(userTimezone);
            var end = moment.utc(timestamp).tz(userTimezone).add(1, 'hours');
            $("#searchrange").data("daterangepicker").setStartDate(start);
            $("#searchrange").data("daterangepicker").setEndDate(end);
            triggerSearch();
            stopLiveUpdates = true;

            $('#searchrange span').html(
                start.format('MMMM D, YYYY')
                + ' - '
                + end.format('MMMM D, YYYY'));
        }
    });
}

function triggerSearch() {
    shouldIgnoreHistogram = true;
    $("#searchrange").trigger("apply.daterangepicker");
    shouldIgnoreHistogram = false;
}
function resetHistogram() {
    configureTimePicker();
    performSearch(0);
    $('#resetHistogram').attr('hidden', 'true');
}

function configureTimePicker() {
    //TODO user-specific locale and date format
    var options = createDatepickerOptions(7, false, userTimezone);
    initializeDateRange("#reportrange", 7);
    $('#reportrange').daterangepicker(options, getDatepickerChangeFunction("#reportrange"));

    var searchOptions = createDatepickerOptions(7, true, userTimezone);
    initializeDateRange("#searchrange", 7);
    initializeDateRange("#searchrangeAgg", 7);
    initializeDateRange("#searchrangeNumericAgg", 7);
    $('#searchrange').daterangepicker(searchOptions, getDatepickerChangeFunction("#searchrange"));
    $('#searchrangeAgg').daterangepicker(searchOptions, getDatepickerChangeFunction("#searchrangeAgg"));
    $('#searchrangeNumericAgg').daterangepicker(searchOptions, getDatepickerChangeFunction("#searchrangeNumericAgg"));

    $('#reportrange').on('apply.daterangepicker',
        function (ev, picker) {
            populateHistogram();
            stopLiveUpdates = true;
            populateStatistics(false);
            initCustomCharts();
        });

    $('#searchrange').on('apply.daterangepicker',
        function (ev, picker) {
            endPeriodIsNow = false;
            stopLiveUpdates = true;
            performSearch(0);
        });


    $('#searchrangeAgg').on('apply.daterangepicker',
        function (ev, picker) {
            performAggregation();
        });

    $('#searchrangeNumericAgg').on('apply.daterangepicker',
        function (ev, picker) {
            performNumericAggregation();
        });
}

function getDatepickerChangeFunction(target) {
    return function (start, end, label) {
        $(target + ' span')
            .html(start.format('MMMM D, YYYY')
                + ' - '
                + end.format('MMMM D, YYYY'));
    };
}

function initDoughnutChart(target, animate) {
    var labels = $(target).data("labels").toString().split(",");
    var dataString = $(target).data("chart-data").toString();
    // single-entry values
    if (typeof dataString === 'number') {
        dataString = dataString.toString();
    }
    var data = dataString.split(",");

    var settings = {
        type: 'doughnut',
        tooltipFillColor: "rgba(51, 51, 51, 0.55)",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: chartColors
            }]
        },
        options: {
            legend: {
                display: false
            },
            responsive: true
        }
    }

    if (!animate) {
        settings.options.animation = false;
    }

    $(target).each(function () {
        var chartElement = $(this);
        var chartDoughnut = new Chart(chartElement, settings);
        $(target).data("chart-id", chartDoughnut.id);
    });
}

function initHorizontalBarChart(target, animate) {

    var labels = $(target).data("labels").toString().split(",");
    var data = $(target).data("chart-data").toString().split(",");
    var settings = {
        type: 'horizontalBar',
        tooltipFillColor: "rgba(51, 51, 51, 0.55)",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: chartColors
            }]
        },
        options: {
            legend: {
                display: false
            },
            responsive: true
        }
    }
    if (!animate) {
        settings.options.animation = false;
    }
    $(target).each(function () {
        var chartElement = $(this);
        var charthorizontalBar = new Chart(chartElement, settings);
        $(target).data("chart-id", charthorizontalBar.id);
    });
}

function nl2br(str) {
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br />' + '$2');
}

function showMessage() {
    var message = getParameterByName("message");
    if (message) {
        $(".home-message").html(message);
    }
}

function performPredefinedSearch() {
    var searchQuery = getParameterByName("searchQuery");
    if (searchQuery) {
        $("#searchBox").val(searchQuery);
        $("#searchButton").click();
    }
}

function configureToggleStatsPanelButtons() {
    $(".stats-panel-toggle").click(function () {
        var toggleButton = $(this);
        var panel = $(this).parent().parent().find(".x_content table");
        if (panel.is(":visible")) {
            panel.parent().parent().css("min-height", "0px");
        } else {
            panel.parent().parent().css("min-height", "530px");
        }
        panel.slideToggle("400", function () {
            var show = $(this).is(":visible");
            localStorage['panel-' + $(toggleButton).data("panel")] = show;
            if (show) {
                toggleButton.removeClass("fa-caret-square-o-up").addClass("fa-caret-square-o-down");
            } else {
                toggleButton.removeClass("fa-caret-square-o-down").addClass("fa-caret-square-o-up");
            }
        });
    });

    // on startup load the configuration from local storage and close the unwanted panels
    $(".stats-panel-toggle").each(function (idx, element) {
        var show = localStorage['panel-' + $(element).data("panel")];
        if (show === 'true') {
            $(element).click();
        }
    });
}

function saveSearch() {

    var name = $("#saveName").val();
    if(!name) {
        return;
    }

    var startDate = $("#searchrange").data("daterangepicker").startDate;
    var endDate = $("#searchrange").data("daterangepicker").endDate;
    var query = $("#searchBox").val();
    var encryptionKey = $("#encryptionKey").val();

    if (query == "") {
        query = "*:*";
    }

    var saveSearchUrl = "/search/saved?query=" + encodeURIComponent(replaceSlash(query)) + "&start="
        + startDate + "&end=" + endDate + "&page=0&pageSize=" + searchPageSize + "&name=" + name + "&relative=true"

    $.ajax({
        url: saveSearchUrl,
        type: "POST",
        success: function (data) {
            populateSavedSearchDropdown(data);
            initSavedSearches();
            $.notify("Search saved", "info");
        }
    });
    $('#saveSearchDialog').dialog("close");
    $("#saveName").val("");
}

function initSavedSearches() {
    $( "#savedSearches a" ).each(function() {

        var id = $(this).attr("id");
        if(id.startsWith("saved")){
            $(this).click(function () {
                performSavedSearch(id.substring(5))
            });
        }
        if(id.startsWith("del")){
            $(this).click(function () {
                deleteSavedSearch(id.substring(3))
            });
        }
    });

}

function deleteSavedSearch(savedSearchId) {
    $.ajax({
        url: "/search/saved?savedSearchId=" + savedSearchId,
        type: "DELETE",
        success: function (data) {
            populateSavedSearchDropdown(data);
            initSavedSearches();
            $.notify("Search deleted", "info");
        }
    });
}

function populateSavedSearchDropdown(data) {
    $('#savedSearches li').each(function() {
        if ($(this).attr("class") != "save-search-button-element") {
            $(this).remove();
        }
    });

    $.each(data, function (idx, entry) {
        var searchOption =
            '<li class="divider"></li><li><div>'+
            '<a id="saved'+ entry.id +'">&nbsp;&nbsp;&nbsp;'+ htmlEscape(entry.name) +'</a>'+
            '<a class="pull-right" id="del'+ entry.id +'"><i class="fa fa-trash-o fa-fw"></i></a>'+
            '</div></li><li class="divider"></li>';

        $('#savedSearches').prepend(searchOption);

    });
}

function initRankingLinks() {
    $(".ranking-link").click(function() {
        var type = $(this).data("ranking-type");
        var startDate = $("#reportrange").data("daterangepicker").startDate;
        var endDate = $("#reportrange").data("daterangepicker").endDate;
        window.location = '/statistics/rankings?type=' + type + "&count=100&start=" + startDate + "&end=" + endDate;
    });
}
function htmlEscape(str){
    if (str){
        var result =  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\//g, "&#047;");
        return result;
    }
    else {
        return "";
    }
}

function jsEscape(str){
    if(str){
        var result = str.replace(/\\/g, "\\u005C").replace(/\t/g, "\\u0009").replace(/\n/g, "\\u000A").replace(/\f/g, "\\u000C").replace(/\r/g, "\\u000D").replace(/"/g, "\\u0022").replace(/%/g, "\\u0025").replace(/&/g, "\\u0026").replace(/'/g, "\\u0027").replace(/\//g, "\\u002F").replace(/</g, "\\u003C").replace(/>/g, "\\u003E");
        return  result;
    }
    else {
        return "";
    }
}

function abbreviateAndEscape(str, size){
    if (!str) {
        return "";
    }
    if (size < 3 || str.length <= size) {
        return htmlEscape(str);
    }
    return htmlEscape(str.substring(0, Math.min(str.length, size - 3)) + "...");
}

function showParams(params) {
    $('<div />').html('<table>' +
        '<tr><td>Params:</td> <td>&nbsp;' + params + '</td></tr>' +
        '</table>').dialog({
        width: "300px;",
        modal: true,
        open: function (event, ui) {
            $('.ui-widget-overlay').bind('click', function () {
                $(this).siblings('.ui-dialog').find('.ui-dialog-content').dialog('close');
            });
        }
    });
}

function generateReport(type) {
    var start = $("#reportrange").data("daterangepicker").startDate;
    var end = $("#reportrange").data("daterangepicker").endDate;
    window.open("/reports/" + type + "?start=" + start + "&end=" + end,'_blank');
}

function generateXlsReport() {
    var start = $("#reportrange").data("daterangepicker").startDate;
    var end = $("#reportrange").data("daterangepicker").endDate;
    window.location = "/statistics/report?start=" + start + "&end=" + end;
}

function queryExcerpt() {
    var query = $("#searchBox").val();
    if (!query) {
        return "*";
    }
    var detailsStartIdx = query.indexOf('details:') + 8;
    var endIdx = query.indexOf(" AND ", detailsStartIdx);
    if (endIdx < 0) {
        endIdx = query.indexOf(" OR ", detailsStartIdx);
    }
    if (endIdx < 0) {
        endIdx = query.length ;
    }
    var result = query.substring(detailsStartIdx, endIdx);
    return result;
}

function initGraphVisuzliation(){
    var actors = new Set();
    var entities = new Set();
    var actions = new Set();

    $("#searchResults > tbody  > tr").each(function() {
        var action = $(this).find("td:nth-child(2) a").text();

        if (action != "GENESIS") {
            var entityType = $(this).find("td:nth-child(3) a:nth-child(1)").text();
            var entityId = $(this).find("td:nth-child(3) a:nth-child(2)").text();
            var actor = $(this).find("td:nth-child(1) a").text();
            entities.add(entityType + " #" + entityId);
            actors.add(actor);

            actions.add(actor + "->" + action + "->" + entityType + " #" + entityId);
        }
    });

    var nodes = [];

    var i =0;
    actors.forEach(function(actor) {
        var color = chartColors[(i++)%chartColors.length];
        nodes.push({id: actor, label: actor, shape: "icon", icon:{code:"\uf007", color : color}});
    });
    i =0;
    entities.forEach(function(action) {
        var color = chartColors[(i++)%chartColors.length];
        nodes.push({id: action, label: action, shape:"box", color:color});
    });

    var edges = [];
    actions.forEach(function (actionInfo) {
        var split = actionInfo.split("->");
        var actor = split[0];
        var action = split[1];
        var entity = split[2];
        edges.push({from: actor, to: entity, label : action, arrows : {to : true}})
    });

    // create an array with nodes
    var nodes = new vis.DataSet(nodes);
    // create an array with edges
    var edges = new vis.DataSet(edges);
    // create a network
    var container = document.getElementById('graph');
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {};
    var network = new vis.Network(container, data, options);
}



