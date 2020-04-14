var sj = {}
$.ajax({
    type: "GET",
    url: "src/data/emoji.json",
    success: function (data) {
        sj = data
    },
    dataType: "json",
    cache: true
});

const emojiRegex = require('emoji-regex');
const {
    Segment,
    useDefault
} = require('segmentit');

const regex = emojiRegex();

function isEmojiChar(text) {
    if (regex.exec(text) == null) {
        if (regex.exec(text) == null) {
            return false
        } else {
            if (text.search(/[\u{4e00}-\u{9fa5}_a-zA-Z0-9]/ug) == -1) {
                return true
            } else {
                return false
            }

        }
    }
    if (text.search(/[\u{4e00}-\u{9fa5}_a-zA-Z0-9]/ug) == -1) {
        return true
    } else {
        return false
    }
}

const getTextFeature = (text, color) => {
    try {
        const canvas = document.createElement('canvas');
        /*
          因为进行scale以后的图案区域实际上不能确定，
          理论上应该只在(0,0,1,1)，但有的也会在它周围的像素里，
          综合效率的考虑，给一个2*2的范围是比较合适的;
        */
        canvas.width = 2;
        canvas.height = 2;

        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '100px sans-serif';
        ctx.fillStyle = color;
        ctx.scale(0.01, 0.01);
        ctx.fillText(text, 0, 0);

        const imageData = ctx.getImageData(0, 0, 2, 2).data;
        // 在一些系统里Uint8ClampedArray不支持常规的数组方法，需要转换一下
        const imageDataArr = [];
        for (let i = 0; i < imageData.length; i++) {
            imageDataArr[i] = imageData[i];
        }

        return imageDataArr.reduce((a, b) => (a + b), 0) > 0 ?
            imageDataArr.toString() : false;
    } catch (e) {
        return false;
    }
};

const distribute = (text, mode) => {
    const feature = getTextFeature(text, '#000');
    return mode ? (feature && feature === getTextFeature(text, '#FFF'))
        : feature;
};

const ifEmoji = (text) => {
    const mode = distribute('😁');
    return distribute(text, mode);
}
var bfl = Object.assign({}, sj), bfsy = {}, sy = {}
Object.keys(sj).forEach(function (key) {
    sy[pinyinUtil.getPinyin(key, '', false, true) + ""] = key
    if (!ifEmoji(sj[key]) && isEmojiChar(sj[key])) {
        eval("delete bfl." + key)
    } else {
        bfsy[pinyinUtil.getPinyin(key, '', false, true) + ""] = key
    }
});

const segmentit = useDefault(new Segment());
var inst = new mdui.Tab('#tab'), index = 0;
document.getElementById('skinSel').addEventListener('change.mdui.select', function (event) {
    $("#up").text("给" + $("#skinSel")[0][$("#skinSel").val()].innerText + "转")
});

var skin = $("#skinSel")[0][$("#skinSel").val()].innerText
$(() => {
    $('#skinSel').change(() => {
        // console.log('change');
        // console.log($('#cont select option:selected').text());
        console.log($('#skinSel').val());
        temp = $(".mdui-panel-item-summary,.mdui-checkbox,#up")
        for (i = 0, len = temp.length; i < len; i++) {
            temp.eq(i).html(temp.eq(i).html().replace(eval("/" + skin + "/g"), $("#skinSel")[0][$("#skinSel").val()].innerText))
        }
        skin = $("#skinSel")[0][$("#skinSel").val()].innerText
    });
});


$("#up").click(function () {
    var res = ''
    console.log(index, 1)

    var k = $("#t").val(),
        jieba = segmentit.doSegment(k),
        ck = sj,
        indexa = sy
    if ($("input[id='checklook']").is(':checked') == true) {
        ck = bfl, indexa = bfsy
    }
    console.log(jieba)
    if ($("input[name='group1']:checked").val() == "1") {
        for (i = 0, len = jieba.length; i < len; i++) {
            var word = jieba[i]['w'].trim()
            if (typeof (ck[word]) != "undefined") {
                res += ck[word]
            } else {
                if (word.length > 0) {
                    characters = word.split("")
                    for (j = 0, wlen = characters.length; j < wlen; j++) {
                        if (typeof (ck[characters[j]]) != "undefined") {
                            res += ck[characters[j]]
                        } else {
                            res += characters[j]
                        }
                    }
                } else {
                    res += word
                }
            }
        }
    } else {
        for (i = 0, len = jieba.length; i < len; i++) {
            var word = jieba[i]['w'].trim(),
                r = ck[word]
            if (typeof (r) != "undefined") {
                res += ck[word]
            } else if (typeof (r) == "undefined") {
                var wordPy = pinyinUtil.getPinyin(word, '', false, true)
                if (typeof (indexa[wordPy]) != "undefined") {
                    res += ck[indexa[wordPy]]
                } else {
                    if (word.length > 0) {
                        characters = word.split("")
                        for (j = 0, wlen = characters.length; j < wlen; j++) {
                            var character = characters[j]
                            if (typeof (ck[character]) != "undefined") {
                                res += ck[character]
                            } else {
                                var characterPy = pinyinUtil.getPinyin(character, '', false, true)
                                if (typeof (indexa[characterPy]) != "undefined") {
                                    res += ck[indexa[characterPy]]
                                } else {
                                    res += character
                                }
                            }
                        }
                    } else {
                        res += word.trim()
                    }
                }
            }
        }
    }
    if ($("input[id='checkda']").is(':checked') == true) {
        res = res.replace(/大/g, "带")
    }
    if ($("input[id='checkai']").is(':checked') == true) {
        res = res.replace(/💓/g, "i")
    }
    if ($("input[id='checkye']").is(':checked') == true) {
        res = res.replace(/我/g, "👴")
    }
    if ($("#skinSel").val() != 0) {
        res = res.replace(/👴/g, $("#skinSel")[0][$("#skinSel").val()].innerText)
    }
    print(res)
});

function print(res) {
    $("#res").text(res)
    $('#copy').attr('data-clipboard-text', res)
}

var clipboard = new ClipboardJS('#copy');
clipboard.on('success', function (e) {
    mdui.snackbar({
        message: '复制成功'
    });
});

clipboard.on('error', function (e) {
    mdui.snackbar({
        message: '复制失败，用其他浏览器试试？'
    });
});