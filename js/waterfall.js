$(function() {
    var $container = $('#waterFall');
    $container.imagesLoaded( function(){
        $container.masonry({
            itemSelector : '.cell',
            isAnimated: true,
            isResizableL:true
        });
    });

    var tur = true;
    $(window).scroll(function(){
        // 当滚动到最底部以上100像素时， 加载新内容
        if ($(document).height() - $(this).scrollTop() - $(this).height()<100) {
            if (tur) {
                setTimeout(function() {
                        tur = true;
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

        var newIntroduce = $(value).attr('author');//新的作者
        var newPrice = $(value).attr('price');//新的价格
        var newClassify = $(value).attr('classify');//新的分类
        var newRecommend = $(value).attr('recommend');//新的推荐

        var $elemTemp = $( "#waterFall > div" ).eq(0).clone(true);

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

        $elemTemp.hide();//新元素，默认隐藏

        return $elemTemp;
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
        $(this).clone().prependTo($('#contentSort'));
        var imgHeight = $('#contentSort .thumbnail').outerHeight(true);
        var winHeight = $(window).height();
        if(imgHeight > winHeight){
            $('#popupbg .next,#popupbg .btn_close').css('right','17px');
        }else{
            $('#popupbg .next,#popupbg .btn_close').css('right','0');
           // $('#contentSort .thumbnail').css('margin-top',(winHeight-imgHeight)/2+'px');
        }
    });

    $('#popupbg .btn_close').click(function(event){
        event.stopPropagation();
        $('#popupbg').hide();
            $("body").removeClass("over_hide");
    });

    $('#popupbg .btn_close,#popupbg .arrows').hover(function(){
        $(this).addClass('hover');
    },function(){
        $(this).removeClass('hover');
    })
    $('#popupbg .next').click(function(){

    })
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