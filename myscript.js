function makeEditableAndHighlight(colour) {

    var range, sel = window.getSelection();
    // if (sel.rangeCount && sel.getRangeAt) {
    //     range = sel.getRangeAt(0);
    // }

    document.body.contentEditable = 'true';
    document.designMode = "on";
    // if (range) {
    //     sel.removeAllRanges();
    //     sel.addRange(range);
    // }
    // Use HiliteColor since some browsers apply foreColor to the whole block
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('foreColor', false, colour);
    // document.execCommand('bold', false, null);

    // if (!document.execCommand("HiliteColor", false, colour)) {
    //     document.execCommand("foreColor", false, colour);
    // }

    document.designMode = "off";

    document.body.contentEditable = 'false';
}
function highlight(colour) {
    var range, sel;
    if (window.getSelection) {
        // IE9 and non-IE
        try {
            if (!document.execCommand("foreColor", false, colour)) {
                makeEditableAndHighlight(colour);
            }
        } catch (ex) {
            makeEditableAndHighlight(colour)
        }
    } else if (document.selection && document.selection.createRange) {
        // IE <= 8 case
        range = document.selection.createRange();
        range.execCommand("foreColor", false, colour);
    }
}
function getHitWord(hit_elem, e) {
    var hit_word = '';
    hit_elem = $(hit_elem);

    //text contents of hit element
    var text_nodes = hit_elem.contents().filter(function () {
        return this.nodeType == Node.TEXT_NODE && this.nodeValue.match(/[a-zA-Z]{2,}/)
    });

    //bunch of text under cursor? break it into words
    if (text_nodes.length > 0) {
        var original_content = hit_elem.clone();

        //wrap every word in every node in a dom element
        text_nodes.replaceWith(function (i) {
            return $(this).text().replace(/([a-zA-Z-]*)/g, "<word>$1</word>")
        });

        //get the exact word under cursor
        var hit_word_elem = document.elementFromPoint(e.clientX, e.clientY);

        if (hit_word_elem.nodeName != 'WORD') {
            console.log("missed!");
        }
        else {
            hit_word = $(hit_word_elem).text();
            console.log("got it: " + hit_word);
            // document.elementFromPoint(e.clientX, e.clientY).style.backgroundColor = lexiIconColor;
            // document.elementFromPoint(e.clientX, e.clientY).style.color = '#FFFFFF';
        }

        // hit_elem.replaceWith(original_content);

    }
    // const x = document.elementFromPoint(e.clientX, e.clientY);
    // x.addEventListener('mouseleave', (e) => {
    //     if (x !== null) {
    //         x.style.backgroundColor = '';
    //         x.style.color = '';
    //     }
    // });
    return hit_word;
}
function audioPlay(audio) {
    if (document.getElementById(audio))
        document.getElementById(audio).play();
};
var sel = '', selTextNode = '';
var translateData = '';
var extEn = true;
document.addEventListener('contextmenu', (e) => {
    $(".iconTiptext").remove();
    if (window.getSelection())
        $("#" + window.getSelection().toString().toLowerCase()).css('color', '');
});

document.addEventListener('keyup', (e) => {
    if (e.keyCode === 27) {

        if (window.getSelection())
            $("#" + window.getSelection().toString().toLowerCase()).attr('style', 'color:""')
        $(".iconTiptext").remove();   // esc
    }

});

function getOffset(el) {
    var _x = 0;
    var _y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft /*- el.scrollLeft*/;
        _y += el.offsetTop/* - el.scrollTop*/;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
    // var p = el;
    // return { top: p.offsetTop, left: p.offsetLeft };
}
function _getCookie(cname) {
    var name = cname + "=";

    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function check(s) {
    var PersianOrASCII = /[آ-ی]|([a-zA-Z])/;
    if ((m = s.match(PersianOrASCII)) !== null) {
        if (m[1]) {
            return false;
        }
        else { return true; }
    }
    else { return true; }
}

var showLexiIconFlg = true;

if (localStorage.showLexiIconFlg !== undefined)
    showLexiIconFlg = JSON.parse(localStorage.showLexiIconFlg);
var lexiIconColor = (localStorage.lexiIconColor) ? (localStorage.lexiIconColor) : "#EC2578";
var userTocken;
if (chrome.runtime !== undefined)
    if (chrome.runtime.onMessage !== undefined)
        chrome.runtime.onMessage.addListener(
            function (request, sender, sendResponse) {
                if (request.showLexiIconFlg !== undefined)
                    showLexiIconFlg = JSON.parse(request.showLexiIconFlg);
                else {
                    showLexiIconFlg = true;
                }
                if (request.lexiIconColor !== undefined)
                    lexiIconColor = request.lexiIconColor;
                else
                    lexiIconColor = "#EC2578";

                if (request.userTocken !== undefined) {
                    userTocken = request.userTocken;
                } else {

                }
                localStorage.setItem('userTocken', userTocken);
                localStorage.setItem('showLexiIconFlg', JSON.stringify(showLexiIconFlg));
                localStorage.setItem('lexiIconColor', lexiIconColor);
            });



if (userTocken === undefined) {
    showLexiIconFlg = true;
}
document.addEventListener('dblclick', (e) => {
    if (!check(window.getSelection().toString())) {
        if (chrome.extension)
            chrome.extension.sendRequest({ 'message': 'checkStatus', 'data': 'sel' }, (response) => {
                if (response != undefined)
                    extEn = response.data;
                if (extEn) {
                    $(".iconTiptext").remove();
                    sel = (window.getSelection().toString()).replace(' ', '');
                    selTextNode = window.getSelection();
                    if (!$(window.getSelection().baseNode.ownerDocument.activeElement).hasClass('editable')
                        || ($(window.getSelection().baseNode.ownerDocument.activeElement)[0].localName) !== 'textarea')
                        // if (JSON.parse(localStorage.showLexiIconFlg) || !localStorage.userTocken)
                        if (showLexiIconFlg)
                            highlight(lexiIconColor);
                        else
                            return;

                    // if (JSON.parse(localStorage.showLexiIconFlg) || !localStorage.userTocken)
                    if (showLexiIconFlg)
                        if (sel.length) {

                            const elementWhereSelectionStart = selTextNode.anchorNode;
                            const closestBlockElement = elementWhereSelectionStart.parentNode;

                            var iconPos = getOffset(closestBlockElement);

                            // $(closestBlockElement).addClass('iconTip');
                            $(closestBlockElement).attr('id', sel.toLowerCase());

                            $(closestBlockElement).bind('mousemove', function (e) {
                                $(".showtipResize").css('visibility', 'hidden');
                                $(".showtipResize").css('opacity', '0');

                                if ($(".showtipResize#" + e.currentTarget.id).length > 0) {
                                    $(".showtipResize#" + e.currentTarget.id).css('visibility', 'visible');
                                    $(".showtipResize#" + e.currentTarget.id).css('opacity', '1');
                                }
                            });
                            if (document.getElementById("iconTiptext" + sel.toLowerCase()) != null)
                                document.getElementById("iconTiptext" + sel.toLowerCase()).remove();

                            // if (JSON.parse(localStorage.showLexiIconFlg) || !localStorage.userTocken)
                            $(document.body).append('<div style="display: block;position: absolute;top: ' + ((iconPos.top) + $("#" + sel.toLowerCase()).height()) + 'px;left: ' + iconPos.left + 'px;" id="iconTiptext' + sel.toLowerCase() + '" class="iconTiptext logoTip"><img id="iconTipBtn" src="http://lexi.land/logo_tip.png"/></div>');
                            setTimeout(function () {
                                document.body.contentEditable = 'false';
                            }, 1000);

                            document.getElementById("iconTiptext" + sel.toLowerCase()).addEventListener('click', function (e) {
                                $(".iconTiptext").html('<img id="" src="http://lexi.land/logo_tip.gif"/>');

                                openBox(closestBlockElement, iconPos, $("#" + sel.toLowerCase()).height());
                            });
                        }
                } else {
                    return;
                }
            });

    }
});
function sayWhatHappenMyScript(msg) {
    var tmplMsg = 'error';

    if (window.getSelection())
        $("#" + window.getSelection().toString().toLowerCase()).css('color', '');

    switch (msg) {
        case 'invalidEmailAddress': {
            tmplMsg = 'please insert correct email address.';
            break;
        }
        case 'userNotFound': {
            tmplMsg = 'invalid email address.';
            break;
        }
        case 'notMached': {
            tmplMsg = 'password and re-password is not mache';
            break;
        }
        case 'fillTheField': {
            tmplMsg = 'please fill oute the fields.'
            break;
        }
        case 'checkEmail': {
            tmplMsg = 'Check your Email to verify your registration info..'
            break;
        }
        case 'invalidPass': {
            tmplMsg = 'Invalid password.'
            break;
        }
        case 'dublicateCard': {
            return 'dublicate Card'
        }
        case 'reloadPage': {
            tmplMsg = 'please reload your web page.'
            break;
        }
        default: {
            tmplMsg = msg;
            break;
        }
    }
    if (document.getElementById("msgExtArBox"))
        document.getElementById("msgExtArBox").remove();
    var tmpl = '<div id="msgExtArBox" style="display: block;position: fixed;top: 5%;left: 50%;width: 560px;height: 100px;background-color: #432579;background-image: url(http://lexi.land/bkSetting.jpg);background-position: center center;background-repeat: no-repeat;color: #FFFFFF;font-family: tahoma;text-align: center;padding: 0px;margin: auto;margin-left: -310px;z-index: 9999;overflow: hidden;">' +
        '<div style="display: block;position: relative; color: #6EF7CF;line-height: 25px;vertical-align: middle;font-size: 17px;font-weight: 500;text-align: center;padding: 10px;padding-top: 40px;">' + tmplMsg + '</div>' +
        '<div style="display: block;position: absolute;top: 0px;right: 0px;text-align: center !important;font-style: normal !important;text-decoration: none !important; z-index: 9;">' +
        '<div style="width: 32px;height: 32px;line-height: 36px;vertical-align: middle;background-color: #6EF7CF;color: #0B277A;font-size: 14px;font-weight: 500;margin: 5px;cursor: pointer;"><span style="text-align: center !important;font-style: normal !important;text-decoration: none !important;">X</span></div></div></div>';
    $(document.body).append(tmpl)

    document.getElementById("msgExtArBox").addEventListener('click', function (e) {
        document.getElementById("msgExtArBox").remove();
    });
}
function openBox(closestBlockElement, ePos, elemHeght) {

    if ($(window.getSelection().baseNode.ownerDocument))
        if (!$(window.getSelection().baseNode.ownerDocument.activeElement).hasClass('editable')
            || ($(window.getSelection().baseNode.ownerDocument.activeElement)[0].localName) !== 'textarea')
            // if (JSON.parse(localStorage.showLexiIconFlg) || !localStorage.userTocken)
            if (showLexiIconFlg)
                highlight(lexiIconColor);
            else
                return;
    window.getSelection().removeAllRanges();
    var eTop = ePos.top;
    if (chrome.extension === undefined) {
        sayWhatHappenMyScript('reloadPage');
        $(".iconTiptext").remove()
        return;
    }
    chrome.extension.sendRequest({ 'message': 'setText', 'data': sel }, (response) => {
        // Add non disturbing border to selected elements
        // For simplicity I've adding outline only for the start element

        translateData = response.data;

        if (translateData === 'error') {
            sayWhatHappenMyScript(response.errorMsg);
            $(".iconTiptext").remove()
            return;
        }

        if (translateData !== '' && translateData !== undefined) {
            //showtipArrowTopRight
            //showtipArrowRight

            if (eTop > 500) {
                ePos.top -= 230;//remembery
                var tmpl = '<div class="showtipResize" style="top: ' + ePos.top + 'px;left: ' + ((ePos.left) - 20) + 'px" id="' + translateData.word + '"><div class="showtip active"><div class="showtipArrow"></div>';
            }
            else {
                ePos.top += elemHeght;
                var tmpl = '<div class="showtipResize" style="top:' + ePos.top + 'px;left:' + ((ePos.left) - 20) + 'px"   id="' + translateData.word + '"><div class="showtip active"><div class="showtipArrowTop"></div>';
            }


            tmpl += '<div class="showtipScrollbar" id="ex3">' +
                '<div class="showtipContent">' +
                '<div class="btnAddPlace"><div class="btnAdd" id="add_' + translateData.word + '"><span class="txtIcon" >+</span>' +
                '</div></div>' +
                '<div id="cardFrontStyle" class="row cardFrontStyle" style="display: table; position: absolute; width: 100%; min-height: 100%; height: auto; font-size: 16px; text-align: center; vertical-align: middle; padding: 10px;">' +
                '<div id="cardFrontStyleIn" class="cardFrontStyleIn" style="display: table-cell; line-height: 23px; vertical-align: middle; font-size: 16px; text-align: center; color: #3A5FFE;">';
            if (translateData.audio.length > 0) {
                tmpl += '<div id="cardFrontStyleInWord" class="cardFrontStyleInWord" style="font-size: 29px; text-align: center; font-weight: 600;"><strong style="font-weight: bold; color: #FFFFFF;">' + translateData.word + '</strong></div>' +
                    '<audio id="audio_' + translateData.word + translateData.audio[0] + '" src="' + translateData.base_url + translateData.audio[0] + '">&nbsp;</audio>' +
                    '<img id="' + translateData.word + translateData.audio[0] + '" src="http://lexi.land/audioFiles/speaker.svg" width="64px" class="wordSpeaker" style="display: table-cell; position: absolute; vertical-align: middle; text-align: center; margin: 0px auto; left: 50%; margin-left: -32px; cursor:pointer;"/>' +
                    '</div>';
            }
            tmpl += '</div>' +
                '<div id="cardBackStyle" class="row cardBackStyle" style="display: table; position: absolute; width: 100%; min-height: 100%; height: auto; font-size: 16px; text-align: center; vertical-align: middle; padding: 10px;">' +
                '<div id="cardBackStyleIn" class="cardBackStyleIn" style="display: table-cell; line-height: 23px; vertical-align: middle; font-size: 16px; text-align: center; color: #3A5FFE;">' +
                '<div style="line-height: 23px; vertical-align: middle;">' +
                '<div class="cardBackStyleInTitle" style="line-height: 23px; vertical-align: middle; text-align: center; color: #CECECE;">' + translateData.gram_grp + '</div>';

            if (typeof (translateData.definitions) !== 'string') {
                Object.keys(translateData.definitions).forEach(function (element) {
                    tmpl += '<div class="cardBackStyleInTitle" style="color: #CECECE;">' + element + ':</div>';
                    for (var iWordDef = 0; iWordDef < (translateData.definitions[element]).length; iWordDef++) {
                        tmpl += '<div id="cardBackStyleInDefinition" class="cardBackStyleInDefinition" style="font-size: 17px; text-align: left; direction: ltr; font-weight: 400; color: #FFFFFF;">'
                            + translateData.definitions[element][iWordDef] + '</div>';
                    }
                });
            }
            tmpl += '</div>';
            if (translateData.fa_definitions && translateData.fa_definitions !== undefined) {
                tmpl += '<div style="line-height: 23px; vertical-align: middle;">' +
                    '<div id="cardBackStyleInDefinitionFa" class="cardBackStyleInDefinitionFa" style="font-size: 17px; text-align: right; direction: rtl; font-weight: 400; color: #4EC1A0;">'
                    + translateData.fa_definitions + '</div>' +
                    '</div>';
            }

            // else  (translateData[response.dst+"_definitions"]) 
            else if (translateData[response.dst + "_definitions"] !== undefined) {
                tmpl += '<div style="line-height: 23px; vertical-align: middle;">' +
                    '<div id="cardBackStyleInDefinitionFa" class="cardBackStyleInDefinition" style="font-size: 17px; text-align: left; direction: ltr; font-weight: 400; color: #4EC1A0!important;">'
                    + translateData[response.dst + "_definitions"] + '</div>' +
                    '</div>';
            }

            if (translateData.examples) {
                tmpl += '<div style="line-height: 23px; vertical-align: middle;">' +
                    '<div class="cardBackStyleInTitle" style="color: #CECECE;">Examples:</div>' +
                    '<div id="cardBackStyleInExample" class="cardBackStyleInExample" style="font-size: 16px; text-align: left; direction: ltr; color: #8E928E;">' + translateData.examples + '</div>' +
                    '</div>';
            }
            tmpl += '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div></div>';

            // $(closestBlockElement).append(tmpl);

            if ($(document).find('div#' + translateData.word) != null)
                $(document).find('div#' + translateData.word).remove();
            // if (showLexiIconFlg || !localStorage.userTocken)
            if (showLexiIconFlg)
                $(document.body).append(tmpl);
            setTimeout(function () {
                $(".iconTiptext").remove();
                $(".iconTiptext#iconTiptext" + (translateData.word).toLowerCase()).remove();

                if ($(".showtipResize#" + translateData.word).length > 0) {
                    $(".showtipResize#" + translateData.word).css('visibility', 'visible');
                    $(".showtipResize#" + translateData.word).css('opacity', '1');
                }
            }, 500);

            if (document.getElementById(translateData.word + translateData.audio[0]))
                document.getElementById(translateData.word + translateData.audio[0]).addEventListener('click', function (e) {

                    document.getElementById('audio_' + e.currentTarget.id).play();
                });

            document.getElementById('add_' + translateData.word).addEventListener('click', function (e) {
                var current = e.currentTarget;
                $("#" + current.id).html('<span class="iconLoading"><svg class="hourglassInline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 206" preserveAspectRatio="none">' +
                    '<path class="hourglassInlineMiddle" d="M120 0H0v206h120V0zM77.1 133.2C87.5 140.9 92 145 92 152.6V178H28v-25.4c0-7.6 4.5-11.7 14.9-19.4 6-4.5 13-9.6 17.1-17 4.1 7.4 11.1 12.6 17.1 17zM60 89.7c-4.1-7.3-11.1-12.5-17.1-17C32.5 65.1 28 61 28 53.4V28h64v25.4c0 7.6-4.5 11.7-14.9 19.4-6 4.4-13 9.6-17.1 16.9z"/>' +
                    '<path class="hourglassInlineOuter" d="M93.7 95.3c10.5-7.7 26.3-19.4 26.3-41.9V0H0v53.4c0 22.5 15.8 34.2 26.3 41.9 3 2.2 7.9 5.8 9 7.7-1.1 1.9-6 5.5-9 7.7C15.8 118.4 0 130.1 0 152.6V206h120v-53.4c0-22.5-15.8-34.2-26.3-41.9-3-2.2-7.9-5.8-9-7.7 1.1-2 6-5.5 9-7.7zM70.6 103c0 18 35.4 21.8 35.4 49.6V192H14v-39.4c0-27.9 35.4-31.6 35.4-49.6S14 81.2 14 53.4V14h92v39.4C106 81.2 70.6 85 70.6 103z"/>' +
                    '</svg></span>');

                chrome.extension.sendRequest({ 'message': 'saveOnServerText', 'data': current.id.split('_')[1] }, (response) => {
                    if (response.data !== 'error' || response.data === 'dublicateCard') {
                        if (response.data === 'dublicateCard') {
                            sayWhatHappenMyScript(response.data);
                        }
                        $('#' + current.id).css('visibility', 'hidden');
                        return;
                    }
                    else {
                        sayWhatHappenMyScript(response.errorMsg);
                        $("#" + current.id).html('<span class="txtIcon" >+</span>');
                        // $('#' + current.id).css('visibility', 'hidden');
                        return;
                    }
                });
            });
        }
    });

};

document.addEventListener('click', function (e) {
    if (e.target.getAttribute('class') !== 'txtIcon' && e.target.getAttribute('class') !== 'wordSpeaker') {
        $(".showtipResize").css('visibility', 'hidden');
        $(".showtipResize").css('opacity', '0');

    }
});
document.addEventListener('mouseup', function (e) {

    var selection;
    if (!check(window.getSelection().toString())) {
        if (window.getSelection().toString() !== '') {

            if (document.getElementById("iconTiptext" + window.getSelection().toString().toLowerCase()) == null) {
                chrome.extension.sendRequest({ 'message': 'checkStatus', 'data': 'sel' }, (response) => {
                    if (response != undefined)
                        extEn = response.data;
                    if (extEn) {
                        // $(".iconTiptext").remove();

                        sel = (window.getSelection().toString()).replace(' ', '');
                        selTextNode = window.getSelection();
                        // if (JSON.parse(localStorage.showLexiIconFlg) || !localStorage.userTocken)
                        if (showLexiIconFlg)
                            if (sel.length) {

                                const clientX = e.clientX;
                                // const clientY = e.clientY;
                                const elementWhereSelectionStart = selTextNode.anchorNode;
                                const closestBlockElement = elementWhereSelectionStart.parentNode;
                                if (closestBlockElement.tagName === 'A') {
                                    // $(".iconTiptext").remove();
                                    // if (document.getElementById("iconTiptext" + sel.toLowerCase()) != null)
                                    //     document.getElementById("iconTiptext" + sel.toLowerCase()).remove();
                                    var iconPos = getOffset(closestBlockElement);
                                    $(closestBlockElement).attr('id', sel.toLowerCase());

                                    $(closestBlockElement).bind('mousemove', function (e) {
                                        $(".showtipResize").css('visibility', 'hidden');
                                        $(".showtipResize").css('opacity', '0');

                                        if ($(".showtipResize#" + e.currentTarget.id).length > 0) {
                                            $(".showtipResize#" + e.currentTarget.id).css('visibility', 'visible');
                                            $(".showtipResize#" + e.currentTarget.id).css('opacity', '1');
                                        }
                                    });
                                    $(document.body).append('<div style="display: block;position: absolute;top: ' + ((iconPos.top) + $("#" + sel.toLowerCase()).height()) + 'px;left: ' + clientX + 'px;" id="iconTiptext' + sel.toLowerCase() + '" class="iconTiptext logoTip"><img id="iconTipBtn" src="http://lexi.land/logo_tip.png"/></div>');

                                    document.getElementById("iconTiptext" + sel.toLowerCase()).addEventListener('click', function (e) {

                                        $(".iconTiptext").html('<img id="" src="http://lexi.land/logo_tip.gif"/>');
                                        iconPos.left = clientX;
                                        openBox(closestBlockElement, iconPos, $("#" + sel.toLowerCase()).height());
                                    });
                                }
                            }
                    }
                });
            }
        }
    }
});