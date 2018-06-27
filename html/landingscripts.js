function update() {
    lastScrape();
    scrapeStatus();
}
window.onload = update();
function lastScrape() {
    $.get("/getLastScrapeTime", function (res) {
        $("#lastScrapeId").get(0).innerText = "Last Scrape: " + res;
    });
}
function scrapeStatus() {
    $.get("/scrapeStatus", function (res) {
        if (res){
            $("#scrapeStatus").get(0).innerText = "Scrape Status: Scraping..";
        }else{
            $("#scrapeStatus").get(0).innerText = "Scrape Status: Not Scraping";
        }
    })
}
function getDepartments() {
    $.get("/getDepartments", function (res) {
        $("#result")[0].innerText = res;
        $("#result").removeClass("prettyprinted");
        PR.prettyPrint();
    })
}
function getDepartmentByCode() {
    code = $('#search')[0].value;
    $.get("/getDepartmentByCode", {code: code}, function (res) {
        $("#result")[0].innerText = res;
        $("#result").removeClass("prettyprinted");
        PR.prettyPrint();
    })
}
function getCoursesByCode() {
    code = $('#search')[0].value;
    $.get("/getCoursesByCode", {code: code}, function (res) {
        $("#result")[0].innerText = res;
        $("#result").removeClass("prettyprinted");
        PR.prettyPrint();
    })
}
function getSectionsByCode() {
    code = $('#search')[0].value;
    $.get("/getSectionsByCode", {code: code}, function (res) {
        $("#result")[0].innerText = res;
        $("#result").removeClass("prettyprinted");
        PR.prettyPrint();
    })
}
function updateSectionInfo() {
    code = $('#search')[0].value;
    $.get("/sectionData", {code: code}, function (res) {
        $("#result")[0].innerText = res;
        $("#result").removeClass("prettyprinted");
        PR.prettyPrint();
    })
}
function showdbinfo() {
    $(".content").hide();
    var x = $("#dbinfo")[0];
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}
function showdbaccess() {
    $(".content").hide();
    var x = $("#dbaccess")[0];
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}
function showapiaccess() {
    $(".content").hide();
    var x = $("#apiaccess")[0];
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}