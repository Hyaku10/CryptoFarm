// LOCAL STORAGE AND INITIAL PAGE LOAD =======================================================================
if(localStorage.length == 0){
    setLocal()
}
let MODAL = false
let A = true
const listOfCurrencies = [
"aed","ars","bch","bdt","bhd","bmd","bnb","brl","cny",
"btc","chf","clp","cny","czk","dkk","dot","eos",
"eth","huf","idr","inr","krw","kwd","lkr","ltc",
"mmk","mxn","myr","ngn","nok","nzd","php","pkr","pln","rub",
"sar","sek","sgd","thb","try","twd","uah","vef","vnd",
"xag","xau","xdr","xlm","xrp","yfi","zar","bits","link","sats"]
generateCurrencies()
checkCheckBoxes()

// set navbar at page load
$('.hidden').hide()
$('#CARDS').show()
$('#search').show()
$('#REPORT').hide()
$('#ABOUT').hide()
$('#SETTINGS').hide()
$('#DEVTOOLS').hide()

// dev tool listeners
$('#clearStorage').on('click', clearLocal)
$('#printStorage').on('click', printLocal)
$('#DEVTOG').on('click', toggleDev)
$('#updateSwitches').on('click', checkAllSwitches)
$('#modal-btn').on('click', function () {$('#callModal').trigger('click')})

// currencies checkbox listener
$('.currency-box').on('click', checkBoxClick)

// NAVBAR ============================================================================

$('#goToCoins').on('click', function(){
    $('#CARDS').show()
    $('#search').show()
    $('#REPORT').hide()
    $('#ABOUT').hide()
    $('#SETTINGS').hide()
})
$('#goToReport').on('click', function(){
    $('#CARDS').hide()
    $('#search').hide()
    $('#REPORT').show()
    $('#ABOUT').hide()
    $('#SETTINGS').hide()
    generateReport()
})
$('#goToAbout').on('click', function(){
    $('#CARDS').hide()
    $('#search').hide()
    $('#REPORT').hide()
    $('#ABOUT').show()
    $('#SETTINGS').hide()
})
$('#goToSettings').on('click', function(){
    $('#CARDS').hide()
    $('#search').hide()
    $('#REPORT').hide()
    $('#ABOUT').hide()
    $('#SETTINGS').show()
})

// COINS/CARDS =======================================================================

$.ajax({
    type:"GET",
    url: "https://api.coingecko.com/api/v3/coins/list",
    datatype:"json",
    success: function(data){
        let limit = 0
        for(const coin of data){
            if(limit<100){
                if(coin.name.length < 10){
                    makeCard(coin.symbol, coin.name, coin.id)
                    limit++
                }
            }
        }
    },
    error: failure
    }
)

$('#search').on('input', searchCoins)
$('.modalClose').on('click', modalClosed)

// Manual card maker
$(document).ready(function(){
    $('#manual').click(function (){
        makeCard('this card','was made manually')
    })
})

// Coins/Cards Functions =================================================================================================

function makeCard(symbol, name, id){
    const cardId = `a${uniqueID()}`
    $('#CARDS').append(`
    <div class="card col-1 m-1 position-relative border border-warning rounded">
        <div class="card-body overflow-auto" style="width:75%;">
            <h5 class="card-title">${symbol.toUpperCase()}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${name}</h6>
            <button id="a${id}" type="button" class="btn btn-primary btn-sm" data-bs-toggle="collapse" data-bs-target="#target${cardId}" aria-expanded="false" aria-controls="example">more info</button>
        </div>
        <div class="form-check form-switch position-absolute" style="right:10%; top:42%; transform:scale(1.5);">
            <input class="form-check-input" type="checkbox" id="switch${id}" coin='${id}' checkSwitch=''>
        </div>
        <div class="collapse position-absolute" id="target${cardId}" style="top: 95%;right:0; z-index: 10;">
            <div class="card card-body border-top-0 border-warning rounded-0" id="content${id}"></div>
        </div>
    </div>
    `)

    $(`#a${id}`).on('click', moreInfo)
    checkSwitch(id)
    // $(`#switch${id}`).on('click', switchClick)
    $(`#switch${id}`).unbind().click(switchClick);
}

function searchCoins(input){
    clearCoins()
    $.ajax({
        type:"GET",
        url: "https://api.coingecko.com/api/v3/coins/list",
        datatype:"json",
        success: filterCoins,
        error: failure
        })
}

function filterCoins(data){
    let counter = 0
    let noResults = 0
    for(const coin of data){
        if(coin.name.toUpperCase().includes($('#search').val().toUpperCase()) && counter < 100){
            makeCard(coin.symbol,coin.name,coin.id)
            noResults++
            counter++
        }
    }
    if(!noResults){
        clearCoins()
        $('#CARDS').append(
        `<div class='card mx-auto' style='background-color: lemonchiffon; border: none; margin: 5rem;'>
                <img src="https://cdn-icons-png.flaticon.com/512/7326/7326025.png">
                <h3 class='justify-content-center' style='display: inline-block;'>no results found  </h3>

        </div>
        `)
    }
}

function moreInfo(event){
    const id = event.target.id.substring(1)
    $.ajax({
        type:"GET",
        url: `https://api.coingecko.com/api/v3/coins/${id}`,
        datatype:"json",
        success: function(data){
            if(!$(`#content${id}`).html()){
                $(`#content${id}`).html(`
                <div>
                    <div style="text-align: center;">
                        <img src="${data.image.large}" alt="coin-logo" style="width:50%; justify-content: center;">
                    </div>
                    <div>
                        <p>${data.name}'s current rates:</p>
                        <p>
                        <img src="https://cdn-icons-png.flaticon.com/512/197/197484.png" 
                        alt="USD-logo" style="width:10%;">
                        USD: ${data.market_data.current_price.usd}$</p>
                        <p>
                        <img src="https://cdn-icons-png.flaticon.com/512/197/197615.png"                   
                        alt="USD-logo" style="width:10%;">
                        EUR: ${data.market_data.current_price.eur}€</p>
                        <p>
                        <img src="https://cdn-icons-png.flaticon.com/512/197/197577.png" 
                        alt="USD-logo" style="width:10%;">
                        ILS: ${data.market_data.current_price.ils}₪</p>
                    </div>
                </div>
                `)
            }
        },
        error: failure
        }
    )
}

function switchClick(event){
    if(A){
        A = false
        cooldown()
        const id = event.target.id.substring(6)
        const report = JSON.parse(localStorage.report)
        if(report.includes(id)){
            removeCoin(id)
        }else if(report.length >= 5 && MODAL == false){
            event.preventDefault()
            MODAL = true
            
            callModal(id)
            sessionStorage.clear()
            sessionStorage.setItem('current', JSON.stringify(id))
        }else{
            addCoin(id)
        }
    }
}

function removeCoin(id){
    const report = JSON.parse(localStorage.report)
    const newArr = []
        for(const coin of report){
            if(id != coin){
                newArr.push(coin)
            } 
        }
        localStorage.setItem('report', JSON.stringify(newArr))
}

function addCoin(id){
    const report = JSON.parse(localStorage.report)
    const newReport = justPush(report,id)
    localStorage.setItem('report', JSON.stringify(newReport))
}

function checkSwitch(id){
    const report = JSON.parse(localStorage.report)
    for(const coin of report){
        if(coin.toLowerCase() == id.toLowerCase()){
            $(`[coin=${id}]`).prop("checked", true)
            return true
        }else{
            $(`[coin=${id}]`).prop("checked", false)
        }
    }
}

function getDataFromId(id){
    $.ajax({
        type:"GET",
        url: `https://api.coingecko.com/api/v3/coins/${id}`,
        datatype:"json",
        success: function(data){
            let coin = []
            const name = data
            coin.push(name.symbol)
            coin.push(name.name)
            coin.push(name.id)
            coin.push(name.image.large)
            coin.push(name.market_data.current_price)
            if(!MODAL){
                makeReportCard(coin[0],coin[1],coin[2],coin[3],coin[4])
            }else{
                makeCardForModal(coin[0],coin[1],coin[2])
            }
        },
        error: failure
        }
    )
}

// Modal Functions =================================================================================================

function callModal(id){
    clearModal()
    $('#callModal').trigger('click')
    const report = JSON.parse(localStorage.report)
    for(const item of report){
        getDataFromId(item)
    }
}

function makeCardForModal(symbol, name, id){
    const cardId = `a${uniqueID()}`
    $('#modalCards').append(`
        <div class="card modalCard col-1 m-1 position-relative border border-warning rounded">
            <div class="card-body overflow-auto" style="width:75%;">
                <h5 class="card-title">${symbol.toUpperCase()}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${name}</h6>
            </div>
            <div class="form-check form-switch position-absolute" style="right:10%; top:42%; transform:scale(1.5);">
                <input class="form-check-input" type="checkbox" id="switch${id}" coin='${id}' checkSwitch=''>
            </div>
        </div>
    `)

    checkSwitch(id)
    $(`[coin=${id}]`).on('click', switchClick)
    $("#modalAddCoin").unbind().click(modalAddCoin);
    // $(`#modalAddCoin`).on('click', modalAddCoin)
    // $ listern.on(event, function)
}

function clearModal(){
    $('.modalCard').remove()
}

function modalClosed(){
    MODAL = false
    // toggleButton()
    clearModal()
    checkAllSwitches()
}

function modalAddCoin(){
    const id = JSON.parse(sessionStorage.getItem('current'))
    const report = JSON.parse(localStorage.report)
    if(report.length < 5 && !report.includes(id)){
        addCoin(id)
        $('#bob').trigger('click')
    }
    else if(report.includes(id)){
            $('#bob').trigger('click')
    }
}

// Report Functions =================================================================================================

function generateReport(){
    $('.reportCard').remove()
    const report = JSON.parse(localStorage.report)
    if(report.length == 0){
        reportIsEmpty()
        return true
    }
    for(const item of report){
        getDataFromId(item)
    }
}

function makeReportCard(symbol, name, id, img, rates){
    const cardId = `a${uniqueID()}`
    const currencies = JSON.parse(localStorage.currencies)

    $('#REPORT').append(`
    <div id='report${id}' class="reportCard overflow-auto d-flex align-items-center flex-row border border-warning rounded m-3 bg-light">
        <div>
            <img class='m-2' style='height:5vw;min-height:100px;' src="${img}" alt="coin icon">
        </div>
        <div class='mx-4'>
            <p class='h4'>${symbol.toUpperCase()}</p> 
            <p class='h5 text-muted'>${name}</p> 
        </div>
    </div>
    `)

    for(const currency of currencies){
        const curr = rates[currency] ? rates[currency] : 'data unavailable'
        $(`#report${id}`).append(`
        <div class='bg-lemon mx-4 text-center border border-warning rounded-pill px-3'>
            <p class='h5'>${currency.toUpperCase()}</p> 
            <p class='h6 text-muted'>${curr}</p> 
        </div>
        `)
    }

    checkSwitch(id)
    $(`[coin=${id}]`).on('click', switchClick)
}

function reportIsEmpty(){
    $('.reportCard').remove()
    $('#REPORT').append(`
    <div id="noReport" class="reportCard text-center" style='position: relative; height: 100vh;'>
        <img class="w-25 mb-n2" style="max-width: 4vw;right:45%;" src="https://cdn-icons-png.flaticon.com/512/3565/3565123.png" alt="decoration">
        <div class="mx-auto mt-n2 w-50 alert alert-primary" role="alert">
        your report is empty. this is where your selected coins will be displayed
        </div>
        <img class="w-25" style="position: absolute; max-width: 10vw; bottom:10%;right:45%;" src="https://cdn-icons-png.flaticon.com/512/346/346264.png" alt="decoration">
    </div>
    `)
}

// Functions for the currency checkboxes =================================================================================================

function checkBoxClick(event){
    const curr = event.target.id
    const currencies = JSON.parse(localStorage.currencies)
    if(currencies.includes(curr)){
        removeCurr(curr)
    }else{
        addCurr(curr)
    }
}

function removeCurr(curr){
    const currencies = JSON.parse(localStorage.currencies)
    const newArr = []
        for(const item of currencies){
            if(curr != item){
                newArr.push(item)
            } 
        }
        localStorage.setItem('currencies', JSON.stringify(newArr))
}

function addCurr(curr){
    const currencies = JSON.parse(localStorage.currencies)
    const newReport = justPush(currencies,curr)
    localStorage.setItem('currencies', JSON.stringify(newReport))
}

function checkCheckBoxes(){
    const currencies = JSON.parse(localStorage.currencies)
    for(const curr of currencies){
        $(`#${curr}`).prop("checked", true)
    }
}

function generateCurrencies(){
    const currencies = listOfCurrencies
    for(const curr of currencies)
        $(`#currencies-here`).append(`
        <div class="form-check">
        <label class="form-check-label" for="flexCheckDefault">
        <input class="currency-box form-check-input" type="checkbox" value="" id="${curr}">
        ${curr.toUpperCase()}
        </label>
        </div>
        `)
}

// Utility Functions =================================================================================================

function clearCoins(){
    $('.card').remove()
}

function failure(error){
    // alert(error)
}

function uniqueID(){
    return Math.floor(Math.random() * Date.now())
}

function clearLocal(){
    localStorage.clear()
    setLocal()
}

function setLocal(){
    localStorage.setItem('report','[]')
    localStorage.setItem('currencies', JSON.stringify(['usd','eur','ils']))
}

function printLocal(){
    console.log(localStorage)
}

function justPush(arr,item){
    arr.push(item)
    return arr
}

function checkAllSwitches(){
    const deez = $('[checkSwitch]')
    const report = JSON.parse(localStorage.report)
    if(report.length == 0){
        $('[checkSwitch]').prop("checked", false)
        return true
    }
    for(const item of deez){
        checkSwitch(item.getAttribute('coin'))
    }
}

function toggleDev(){
    const tog = $('#DEVTOOLS')
    const lbl = $('#DT-label')
    const btn = $('#DT-input')
    tog.toggle()
    lbl.toggleClass('active')
    if(lbl.text()=='show dev tools'){
        lbl.text('hide dev tools')
        return "deez"
    }
    lbl.text('show dev tools') 
}

function cooldown(){
    setTimeout(() => {A = true},200)
}