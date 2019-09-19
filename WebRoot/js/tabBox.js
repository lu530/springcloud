$(function () {
    $('body').append(carHtmlTmpl);
    initEvents();
    initData(NATIONS, 'ABCD');
});

var selectedItems = [];
var arr = [];
function initEvents() {
    // 字母切换
    $(".letterTab").click(function () {
        $(this).addClass('active').siblings().removeClass('active');
        var flag = $(this).find("a").html();
        initData(NATIONS, flag);
        // 将已选的在列表中选中
        var selected = ($(this).parent().parent().find(".itemList dl dd label"));
        for (var i = 0; i < selectedItems.length; i++) {
            $(this).parent().parent().find(".itemList dl")
            for (var j = 0; j < selected.length; j++) {
                if (selectedItems[i] == selected[j].innerHTML) {
                    selected[j].classList.add("active");
                }
            }
        }
    });

    // 列表项的点击事件
    $('body').on('click', '.itemList label', function () {
        var $this = $(this);
        if ($this.hasClass('active')) {
            $this.removeClass('active');
        } else {
            var $itemList = $(this).parents('.itemList');
            if ($itemList.hasClass('no-mulitple')) {
                $itemList.find('.item').removeClass('active');
                selectedItems = [];
            }
            $this.addClass('active');
        }

        if ($this.hasClass("active") && selectedItems.indexOf($this.text()) < 0) {
            selectedItems.push($this.text())
        } else {
            selectedItems.splice($.inArray($this.text(), selectedItems), 1);
        }
    });

    // 保存选中的项
    $('body').on('click', '.confirmBtn', function () {
        var $this = $(this),
            $tabBoxInput = $this.parents('.tabBoxWrap').find('.tabBoxInput'),
            $items = $this.siblings(".itemList").find("label.active");
        var selectedHtml = "",
            codeStr = "",
            nameStr = "";
        for (var i = 0; i < selectedItems.length; i++) {
            if (i == 0) {
                nameStr = selectedItems[i];
            } else {
                nameStr += "," + selectedItems[i];
            }
            var itemCode;
            $.each($items, function (index, element) {
                if (index == i) {
                    itemCode = $(this).attr('code');
                    if (!codeStr) {
                        codeStr += itemCode;
                    } else {
                        codeStr += "," + itemCode;
                    }

                }
            });
            selectedHtml += '<div class="item-selected car-selected" code=' + itemCode + ' name=' + selectedItems[i] + '>' + selectedItems[i] + '<span class="close">×</span></div>';
        }

        selectedHtml += '<i class="inputBtn icon-btn-car icon-list3"></i>'
        // 选择的项目数为 0
        if (selectedItems.length <= 0) {
            selectedHtml = '请选择国籍<i class="inputBtn icon-btn-car icon-list3"></i>'
            $tabBoxInput.html(selectedHtml);
        }
        $tabBoxInput.html(selectedHtml).attr('code', codeStr);

        $this.parents('.tabBoxWrap').removeClass('open');
    });

    // 阻止下拉事件
    $('body').on('click', '.tabBox-dropdown', function () {
        return false;
    });

    // 点击删除项目
    $("body").on("click", ".close", function (event) {
        var $this = $(this),
            $tabBoxInput = $('.tabBoxInput');
        //从selectedItems数组移除元素
        selectedItems.splice($.inArray($this.parent().attr("name"), selectedItems), 1);

        deleteItem($this.parent().attr("name"));
        if ($(".item-selected").length == 0) {
            $tabBoxInput.html('请选择国籍<i class="inputBtn icon-btn-car icon-list3"></i>');
        } else if ($(".item-selected").length == 1) {
            var name = $(".item-selected").attr("name"),
                code = $(".item-selected").attr("code");
        }
        var str = "";
        var ppdmCode = "";
        var arr = $(".tabBoxInput .item-selected");
        for (var i = 0; i < arr.length; i++) {
            if (i < arr.length - 1) {
                str += arr[i].innerText.slice(0, -1) + ",";
                ppdmCode += $(arr[i]).attr("platecode") + ",";
            }
            else {
                str += arr[i].innerText.slice(0, -1)
                ppdmCode += $(arr[i]).attr("platecode");
            }
        }

        event.stopPropagation();
        $('.tabBoxWrap').removeClass('open');
    })

    // 选择按钮
    $('.inputBtn').click(function (event) {
        event.stopPropagation();

        $tabBoxInput = $(this).parents('.tabBoxWrap').find('.tabBoxInput');
        $tabBoxInput.click();
    });
}

function initData(data, letter) {
    // var letter='ABCDFGHJKLMNOPQRSTWXYZ'
    var initdata = {};
    for (var i = 0; i < letter.length; i++) {
        if (data[letter[i]]) {
            initdata[letter[i]] = data[letter[i]];
        }
    }

    $(".itemList").html(tmpl("listTmpl", initdata));
}

// 删除项目
function deleteItem(itemName) {
    $(".item-selected[name='" + itemName + "']").remove();
    $(".item").each(function (index, item) {
        if ($(item).text() == itemName) {
            $(item).removeClass("active");
        }
    })
}

var carHtmlTmpl =   '<script type="text/x-tmpl" id="listTmpl">' +
                    '{% for(var i in o) { %}' +
                        '<dl class="attr-list">' +
                            '<dt class="attr-list-head" >{%= i %}</dt>' +
                            '<dd class="attr-list-body">' +
                                '{% for ( var j = 0; j < o[i].length; j++) { %}' +
                                '<label class="item" code="{%=o[i][j].id %}">{%= o[i][j].title %}</label>' +
                                '{% } %}' +
                            '</dd>' +
                        '</dl>' +
                    '{% } %}' +
                    '</script> ';