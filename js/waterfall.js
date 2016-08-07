$(function() {
    // 页面宽度
    var pageWith =0;

    // 页面初始化瀑布流加载
    var $container = $('#waterFall');
    $container.imagesLoaded( function(){
        $container.masonry({
            itemSelector : '.cell',
            isAnimated: true,
            isResizableL:true
        });

        // 获取到页面宽度
        pageWith = $(document).width() < $('body').width() ? $(document).width() : $('body').width();
    });

    // 滚动到下面时候，加载数据后，瀑布流加载
    var tur = true;
    $(window).scroll(function(){
        // 当滚动到最底部以上100像素时， 加载新内容
        if ($(document).height() - $(this).scrollTop() - $(this).height()<100) {
            if (tur) {
                setTimeout(function() {
                        tur = true;
                        // 加载数据后，瀑布流加载
                        ajax_load_data();
                    },
                    500);
                tur = false;
            }
        }
    });

    // ajax请求加载数据，根据数据显示瀑布流
    function ajax_load_data(){
        $.ajax({
            type:  "GET" ,
            url:  "data.json",
            dataType:  "json" ,
            success:  function (result) {
                if(result.data.length > 0){
                    $.each( result.data, function( index, value ){
                        var $boxes = getNewElem(index, value);
                        $container.append( $boxes );//.masonry("appended", $boxes, true);//追加元素

                        $boxes.find(".img_area img").first().imagesLoaded(function(){//loading图片加载完成
                            $boxes.show(); // 块显示
                            $container.masonry('appended',  $boxes);

                            //真实图片加载完成后重新排序
                            $boxes.find(".img_area img").last().imagesLoaded(function(){
                                //console.log('图片 '+$boxes.find("a img").last().attr('src')+' 加载完成')
                                $boxes.find(".img_area img").last().show();//真实图片显示
                                $boxes.find(".img_area img").first().remove();//loading图片删除
                                $container.masonry('layout');// 重新排序
                            });
                        });
                    });
                }
            },
            error:  function (jqXHR){
                alert( "发生错误："  + jqXHR.status);
            }
        });
    }

    // 获取新的内容块
    function getNewElem(index, value){
        var newSrc = $(value).attr('src');
        if(!checkURL(newSrc)){
            newSrc = 'images/pro_img/'+ newSrc;//新图片地址
        }

        var lodingSrc = 'images/pro_img/loding.gif';//新图片地址

        var newId = $(value).attr('id');//id
        var newIntroduce = $(value).attr('author');//新的作者
        var newPrice = $(value).attr('price');//新的价格
        var newClassify = $(value).attr('classify');//新的分类
        var newRecommend = $(value).attr('recommend');//新的推荐

        var $elemTemp = $( "#waterFall > div" ).eq(0).clone(true);

        // 设置新的 .cell 的 data-id
        $elemTemp.attr('data-id',newId);

        // 设置图片地址
        var $lodingimg = $elemTemp.find(".img_area img"); // loding图片
        $lodingimg.attr('src',lodingSrc).removeClass('thumbnail').addClass('load');
        var $img = $lodingimg.clone().attr('src',newSrc).removeClass('load').addClass('thumbnail').hide();// 需要的图片
        $lodingimg.after($img);// loding图片后面加上需要的图片

        // 设置作者
        var $author = $elemTemp.find(".author");
        $author.html(newIntroduce);

        //设置喜欢
        var $price = $elemTemp.find(".price_num");
        $price.html(newPrice);

       //设置评论数
        var $classify = $elemTemp.find(".classify");
        $classify.html(newClassify);

        //设置是否推荐
        var $recommend = $elemTemp.find("i.jian");
        if(newRecommend){
            $recommend.show();
        }else{
            $recommend.hide();
        }

        return $elemTemp.hide();//新元素，默认隐藏
    }

    /*检查url是否是网站外部地址*/
    function checkURL(URL){
        var str=URL;

        if(str.indexOf("http://")>=0){
            return true
        }
        return false;
    }

    /*弹出层*/
    $('.cell .thumbnail').live('click',function(){
        $("body").addClass("over_hide");
        shadeLayer('#contentSort');
        $('#contentSort').empty();

        var dataId = $(this).parents(".cell").attr('data-id');//找出对应的 data-id的值
        $(this).attr('data-id',dataId).clone(true).prependTo($('#contentSort'));//克隆图片节点，追加到弹出层的内容块

        // 防止抖动，设置为初始页面高度
        $('body,.header').width(pageWith);
    });

    // 关闭按钮
    $('#popupbg .btn_close').click(function(){
        $('#popupbg').hide();
        $("body").removeClass("over_hide");
    });

    $('#popupbg .btn_close,#popupbg .arrows').hover(function(){
        $(this).addClass('hover');
    },function(){
        $(this).removeClass('hover');
    })

    // 下翻按钮
    $('#popupbg .next').click(function(event){
        arrowsEvent("n");
    });

    // 上翻按钮
    $('#popupbg .prve').click(function(event){
        arrowsEvent("p");
    });

    // 翻页箭头事件
    function arrowsEvent(btnType){
        event.stopPropagation();
        var outImage = $('#contentSort .thumbnail').get(0);
        //console.log($(outImage).attr('data-id'));
        var nextItem = findByOutImage(outImage,btnType);
        console.log($(nextItem).attr('data-id'));
        if(nextItem){
            $(outImage).attr('data-id',$(nextItem).attr('data-id'));
            var itemImg = $(nextItem).find('.thumbnail').get(0);
            $(outImage).attr('src',$(itemImg).attr('src'));
            // 动画定位到当前弹出的窗口
            $("html,body").stop().animate({scrollTop:$(nextItem).offset().top},1000);//1000是ms,也可以用slow代替
        }else {
            alert('没有更多了');
        }
    }

    // 查找弹出的图片对应的 .cell div 的下一个 .cell div
    function findByOutImage(outImage,btnType){
        var items = $('.cell[data-id]');// 找出所有的 .cell div
        for (var i=0;i<items.length;i++){
            var item = items[i];
            if($(item).attr('data-id') == $(outImage).attr('data-id')){
                if(btnType == 'n'){
                    return $(item).next().get(0);
                }
                if(btnType == 'p'){
                    return $(item).prev().get(0);
                }
            }
        }
    }
});

/*遮罩层*/
function shadeLayer(obj){
   $("#popupbg").show();
    var left=($(window).width()-$(obj).width())/2;
    var scrollTop=$(document).scrollTop();
    var scrollLeft=$(document).scrollLeft();
    $(obj).css({"top":top+scrollTop,"left":left+scrollLeft});
   $(obj).show();
}