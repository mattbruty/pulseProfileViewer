/**
 * Fires predefined pulse pixels in a specific order to replicate a user journey.
 * @param {String} yourAccount - Your activate account id eg ens-mbruty 
 * @param {Object} pixels - List of the different types of pixels to be fired. params object is required. brand and product are optional. Used to provide a descriptive and useful alert once the process has completed
 * @param {Array} items - Order in which the pixels are to be fired. Should match the property names in pixels eg "SGI"
 * @return {Number} sum
 */
function trafficBuilder(domain){
    if(domain == undefined || domain == ''){
        alert('Your have not provided a pulse domain on which to create your dummy data. Please enter a domain in the Pulse Domain field');
        return;
    }
    let yourAccount = domain;

    let pixels = {
        "SGC": {
            "brand": "St George",
            "product": "Credit Card",
            "params": {
                "cw_PULSE_lastImpressionProduct": "creditCard",
                "cw_PULSE_lastImpressionBrand": "stGeorge",
                "cw_PULSE_lastImpressionDate": "{servertime}",
                "ci_PULSE_brandImpressionsStGeorge": "1",
                "ci_PULSE_productImpressionsCreditcard": "1"
            }
        },
        "WPC": {
            "brand": "Westpac",
            "product": "Credit Card",
            "params": {
                "cw_PULSE_lastImpressionProduct": "creditCard",
                "cw_PULSE_lastImpressionBrand": "Westpac",
                "cw_PULSE_lastImpressionDate": "{servertime}",
                "ci_PULSE_brandImpressionsWestpac": "1",
                "ci_PULSE_productImpressionsCreditcard": "1"
            }
        },
        "SGI": {
            "brand": "St George",
            "product": "Insurance",
            "params": {
                "cw_PULSE_lastImpressionProduct": "insurance",
                "cw_PULSE_lastImpressionBrand": "StGeorge",
                "cw_PULSE_lastImpressionDate": "{servertime}",
                "ci_PULSE_brandImpressionsStGeorge": "1",
                "ci_PULSE_productImpressionsInsurance": "1"
            }
        },
        "WPI": {
            "brand": "Westpac",
            "product": "Insurance",
            "params": {
                "cw_PULSE_lastImpressionProduct": "insurance",
                "cw_PULSE_lastImpressionBrand": "Westpac",
                "cw_PULSE_lastImpressionDate": "{servertime}",
                "ci_PULSE_brandImpressionsWestpac": "1",
                "ci_PULSE_productImpressionsInsurance": "1"
            }
        }
    };

    let items = [
        "SGI",
        "WPC",
        "WPC",
        "SGC",
        "SGI",
        "SGC",
        "WPI",
        "SGC",
        "SGC",
        "WPC",
        "SGC",
        "WPC",
        "WPC",
        "WPC",
        "WPC",
        "WPC"
    ];

    //It appends a pixel...
    let appendPixel = (item, done) => {
        var queryParams = pixels[item]["params"];
        var paramsArray = [];
        for (var key in queryParams) {
            if (queryParams.hasOwnProperty(key)) {
                var value = queryParams[key];
                paramsArray.push(key + "=" + encodeURIComponent(value));
            }
        }
        var paramsString = paramsArray.join('&');
        var url = "//" + yourAccount + "/pc/digitalbalance/?" + paramsString + "&ci_PULSE_counter=1&buster=" + Math.round(Math.random() * 1000000000);
        var x = new Image();
        x.src = url;
        x.onload = (response) => { //onload signals completion of pixel call which in turn calls the done call back, to appendPixel which then calls previousFunc
            console.log(`${item} pixel complete`);
            done(`${item}`);
        };
        console.log(`${item} pixel fired`);
    };

    /*
    ReduceRight starts from the last element in the array
    It builds a 'russian doll' of callbacks resulting in a single function which will run each function in order, waiting for the last to finish for each element.
    This is to avoid issues in writing cookie values before the previous call has completed
    */
    let kickOff = items.reduceRight((previousFunc, currentItem, index, array) => {
        return (msgs) => {
            msgs = msgs || []
            appendPixel(currentItem, (msg) => {
                msgs.push(msg)  
                //Update load progress
                var progress = Math.floor((msgs.length / items.length)*100);
                scope.progress = progress + '%';
                scope.$apply();
                 
                //triggers the next callback only when this one is done:
                previousFunc(msgs)
            });
        };
    }, (msgs) => {
        //the last function that gets called
        console.log('all done: ', msgs);

        //Display an alert that clearly states the outcome of running the script
        //Where available, product or brand info will be used, otherwise pixel name will be used
        var result = "Pulse Journey Successfully Created!\n\nThe following pixels have been fired to replicate user interactions with pulse pixels over a period of time:\n\n";
        for (var i = 0; i < msgs.length; i++) {
            var pixel = pixels[msgs[i]];
            if (pixel["product"] && pixel["brand"]) {
                result += `${pixel["product"]} - ${pixel["brand"]}\n`;
            } else if (pixel["product"]) {
                result += `${pixel["product"]}\n`;
            } else if (pixel["brand"]) {
                result += `${pixel["brand"]}\n`;
            } else { result += `${msgs[i]} Pixel Fired\n` }
        };
        //alert(result);
        scope.progress = '';
        scope.generateData = 'Data Generation Complete';
        scope.$apply();
    });

    kickOff();
}