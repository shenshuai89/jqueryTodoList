/**
 * Created by shenshuai on 2017/2/20.
 */
;(function () {
    'use strict';

    var $form_add_task = $('.add-task')
        , $window = $(window)
        , $body = $('body')
        , task_list = []
        , $detail_task = $('.task-detail')
        , $detail_task_mask = $('.task-detail-mask')
        , $delete_task_handle
        , $detail_task_handle
        , current_index
        , $update_form
        , $task_detail_content
        , $task_detail_content_input
        , $checkbox_complete
        , $msg = $('.msg')
        , $msg_content = $('.msg-content')
        , $msg_comfirm = $msg.find('button')
        , $music = $('.music');

    init();


    $form_add_task.on('submit', on_add_task_form_submit);
    $detail_task_mask.on('click', hide_task_detail);

    function listen_msg_event() {
        $msg_comfirm.on('click', function () {
            hide_msg();
        })
    }

    function on_add_task_form_submit(e) {
        var new_task = {}, $input;
        e.preventDefault();
        $input = $(this).find('input[name=content]');
        new_task.content = $input.val();
        if (!new_task.content) return;
        //var result = add_task(new_task);
        if (add_task(new_task)) {
            //render_task_list();
            $input.val(null);
        }
    }

    /*监听打开task详情的事件*/
    function listen_task_detail() {
        var index;
        $('.task-item').on('dblclick', function () {
            index = parseInt($(this).data('index'));
            show_task_detail(index);
        })
        $detail_task_handle.on('click', function () {
            var $this = $(this);
            var $item = $this.parent().parent();
            index = parseInt($item.data('index'));
            show_task_detail(index);
        })
    }

    function listen_task_delete() {
        $delete_task_handle.on('click', function () {
            var $this = $(this);
            var $item = $this.parent().parent();

            var index = parseInt($item.data('index'));
            pop('确定删除')
                .then(function (r) {
                    r ? delete_task(index) : null;
                });
            //cfm ? delete_task(index) : null;
            //console.log(index);
            // delete_task(index);
            //console.log('$item.data(index)', $item.data('index'));
        })
    }

    function listen_checkbox_complete() {
        $checkbox_complete.on('click', function () {
            var $this = $(this);
            //var is_complete = $this.is(':checked');
            var index = parseInt($this.parent().parent().data('index'));

            var item = get(index);
            if (item.complete) {
                update_task(index, {complete: false});
                console.log("item", item);
            } else {
                //update_task(index,{complete:false});
                update_task(index, {complete: true});
                console.log("item", item);
            }
        })
    }

    function get(index) {
        return store.get('task_list')[index];
    }

    /*查看task详情*/
    function show_task_detail(index) {
        /*生产详情模板*/
        render_task_detail(index);
        current_index = index;
        /*显示详情模板*/
        $detail_task.show();
        $detail_task_mask.show();
    }

    /*更新task*/
    function update_task(index, data) {
        var Index = parseInt(index);
        if (Index === undefined || !task_list[Index])
            return;
        task_list[Index] = $.extend({}, task_list[Index], data);
        //console.log('task_list[Index]', task_list[Index]);
        refresh_task_list();
        //console.log("task_list",task_list)
    }

    /*隐藏task*/
    function hide_task_detail() {
        $detail_task.hide();
        $detail_task_mask.hide();
    }

    /*渲染task详情内容*/
    function render_task_detail(index) {
        if (index === undefined || !task_list[index]) return;
        var item = task_list[index];
        //console.log('item', item);
        var tmp = '<form class="wrapper">' +
            '<div class="content">' +
            item.content +
            '</div>' +
            '<div class="input_item"><input style="display: none; margin-bottom: 10px;" type="text" name="content" value="' + (item.content || '') + '"></div>' +
            '<div>' +
            '<div class="desc input_item">' +
            '<textarea name="desc" id="descTextarea" cols="50" rows="10">' + (item.desc || '') + '</textarea>' +
            '</div>' +
            '</div>' +
            '<div class="remind">' +
            '<label>提醒时间</label>' +
            '<input name="remind_date" type="text" id="reDate" value="' + (item.remind_date || '') + '">' +
            '</div>' +
            '<button type="submit" id="reSubmit">更新</button>' +
            '</form>';

        /*清空task详情模板*/
        $detail_task.html(null);

        /*用新模板填充空的模板*/
        $detail_task.html(tmp);

        $('#reDate').datetimepicker();

        /*选中form元素，之后监听submit事件*/
        $update_form = $detail_task.find('form');

        /*选中task内容元素，*/
        $task_detail_content = $update_form.find('[class=content]');

        /*选中task input的元素*/
        $task_detail_content_input = $update_form.find('[name=content]');

        /*双击input显示隐藏的输入框，并且隐藏原来的内容框*/
        $task_detail_content.on('dblclick', function () {
            $task_detail_content.hide();
            $task_detail_content_input.show();
        })
        /**/
        $update_form.on('submit', function (e) {
            e.preventDefault();
            var data = {};
            /*获取表单中各个input的值*/
            data.content = $(this).find('[name = content]').val();
            data.desc = $(this).find('[name = desc]').val();
            data.remind_date = $(this).find('[name = remind_date]').val();
            //console.log('data', data);
            update_task(index, data);
            hide_task_detail();
        })
    }

    function add_task(new_task) {

        // 添加新的任务到任务列表
        task_list.push(new_task);
        /*更新任务列表*/
        refresh_task_list();
        return true;
    }

    /*刷新数据，并重新显示任务列表*/
    function refresh_task_list() {
        store.set('task_list', task_list);
        render_task_list();
    }

    function init() {
        //store.clear();
        //console.log('first first');
        //首先读取浏览器中有没有task_list数据，如果存在就赋值给变量task_list,没有就是空的数组.
        task_list = store.get('task_list') || [];
        listen_msg_event();
        if (task_list.length) {
            //console.log(task_list);
            //如果task_list存在元素，数组有长度，则渲染列表
            render_task_list();
            //console.log('store.get(task_detail)', store.get('task_list'));
            task_remind_task();
        }
    }

    function task_remind_task() {
        var current_timestamp;
        var itl = setInterval(function () {
            for (var i = 0; i < task_list.length; i++) {
                var item = get(i), task_timestamp;
                if (!item || !item.remind_date || item.infomed) continue;
                current_timestamp = (new Date()).getTime();
                task_timestamp = (new Date(item.remind_date)).getTime();
                //console.log("current_timestamp",current_timestamp);
                //console.log("task_timestamp",task_timestamp);
                if (current_timestamp - task_timestamp >= 1) {
                    update_task(i, {infomed: true})
                    show_msg(item.content);
                }
            }
        }, 300);

    }

    function show_msg(msg) {
        if (!msg) return;
        $msg_content.html(msg);
        $music.get(0).play();
        $msg.show();
    }

    function hide_msg() {
        $msg.hide();
        $music.get(0).pause();
    }

    function render_task_list() {
        //console.log('second second second');
        var $task_list = $('.task-list');
        $task_list.html('');
        var complete_items = [];
        for (var i = 0; i < task_list.length; i++) {
            var item = task_list[i];
            if (item && item.complete) {
                complete_items[i] = (item);
            }
            else {
                var $task = render_task_item(item, i);
                $task_list.prepend($task);
            }
        }

        for (var j = 0; j <= complete_items.length; j++) {
            $task = render_task_item(complete_items[j], j);
            //if (!$task) continue;
            //console.log("$task",$task);
            $("input[checked]").parent().parent().addClass("completed");
            $task_list.append($task);
        }

        //console.log('333333', task_list);
        $delete_task_handle = $('.action.delete');
        $detail_task_handle = $('.action.detail');
        $checkbox_complete = $('.task-list .complete');
        listen_task_delete();
        listen_task_detail();
        listen_checkbox_complete();
        //console.log('$delete_task',$delete_task);
    }

    function delete_task(index) {

        /*
         console.log('task_list', task_list);
         console.log('index', typeof (index));
         console.log('task_list[index]', task_list[parseInt(index)]);*/
        //task_list[index]为什么会出现未定义,数据类型不对
        //var Index = parseInt(index);
        if (index === undefined || !task_list[index]) return;
        delete task_list[index];
        refresh_task_list();
    }

    function render_task_item(data, index) {
        if (!data || !index) return;
        var list_item_tpl =
            '<div class="task-item" data-index="' +
            index + ' "> ' +
            '<span><input class="complete" ' + (data.complete ? 'checked' : '' ) + ' type="checkbox"></span>' +
            '<span class="task-content">' +
            data.content + '</span>' +
            '<span class="fr"><span class="action delete">删除</span><span class="action detail">详情</span></span>' +
            '</div>';

        return list_item_tpl;
    }

    function pop(arg) {
        if (!arg) {
            console.error("pop title is required");
        }
        var conf = {}, $box, $mask, $title, $content, $confirm, $cancel, timer, dfd, confirmed;
        dfd = $.Deferred();

        if (typeof arg == "string") {
            conf.title = arg;
        } else {
            conf = $.extend(conf, arg);
        }

        $box = $('<div>' +
            '<div class="pop-title">' + conf.title + '</div>' +
            '<div class="judge"><button class="btn confirm">确定</button>' +
            '<button class="btn cancel">取消</button></div>' +
            '</div>')
            .css({
                width: 600,
                height: 300,
                background: '#fff',
                position: 'fixed',
                'border-radius': 15,
                'box-shadow': '0 1px 2px rgba(0,0,0,0.5)'
            })
        $title = $box.find('.pop-title').css({
            padding: '15px 10px',
            'font-weight': 900,
            'font-size': 26,
            color: '#D03E12',
            'margin-top':'60px',
            'text-align': 'center'
        })
        $content = $box.find('.pop-content').css({
            padding: '5px 10px',
            'text-align': 'center',
            color: '#0a123c',
            'margin-bottom': '30px'
        })
        $confirm = $box.find('.confirm').css({})
        $cancel = $box.find('.cancel').css({})
        $mask = $('<div></div>')
            .css({
                position: 'fixed',
                background: '#000',
                opacity: 0.5,
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
            })
        timer = setInterval(function () {
            if (confirmed !== undefined) {
                dfd.resolve(confirmed);
                clearInterval();
                delete_pop();
            }
        }, 50)
        $confirm.on('click', on_confirmed)
        $cancel.on('click', on_cancel)
        $mask.on('click', on_cancel);

        function on_confirmed() {
            confirmed = true;
        }

        function on_cancel() {
            confirmed = false;
        }

        function delete_pop() {
            $mask.remove();
            $box.remove();
        }

        function adjust_pop_position() {
            var $win_width = $window.width()
                , $win_height = $window.height()
                , $box_width = $box.width()
                , $box_height = $box.height()
                , move_x
                , move_y;
            move_y = ($win_height - $box_height) / 2 - 50;
            move_x = ($win_width - $box_width) / 2;
            $box.css({
                top: move_y,
                left: move_x
            })
        }

        $window.on('resize', function () {
            adjust_pop_position();
        })


        $mask.appendTo($body);
        $box.appendTo($body);
        $window.resize();
        return dfd.promise();
    }
})();