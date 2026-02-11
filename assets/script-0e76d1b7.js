var whereFrom = "dush";
$(document).ready(function(){
    // Show random location from 1 to 699 on page load
    let randomLocation = Math.floor(Math.random() * 699) + 1;
    drawing(randomLocation);

    async function drawing(pathNum) {
        let pathFetch = await fetch('/assets/js/path_'+whereFrom+'.json')
        , pathArr = await pathFetch.json()
        , respStr = ""
        , thisLoc = pathArr[pathNum] 
        , thisLocXY = {}; 

        for (var elem in thisLoc) {
            thisLocXY[thisLoc[elem].x + '' + thisLoc[elem].y] = thisLoc[elem].to;
        }
        respStr += "<table class=\"path pathfind-table\" style=\"margin:auto;margin-top: -1px;\">";
        for (let row = 0; row < 6; row++) {
            respStr += "<tr>";
            for (let col = 0; col < 10; col++) {
                let cell = col + '' + row;
                respStr += "<td class=\"";
                respStr += (thisLocXY[cell] === undefined) ? " unlit" : " lit";
                respStr += "\">";
                if (thisLocXY[cell] !== undefined) {
                   respStr += "<div class=\"loc_num\">в "+thisLocXY[cell]+"</div>";
                }
                respStr += "</td>";
            }
            respStr += "</tr>";
        }
        respStr += "</table> <i>- "+((whereFrom=="dush")?"Душ":"Степи")+" - "+pathNum+" -</i>";
        $("#show_res").html(respStr);
    }
    async function pathing(fromStr, toStr, fromNum, toNum) {
        let pathFetch = await fetch('/assets/js/path_'+whereFrom+'.json')
        , pathArr = await pathFetch.json()
        , concatFetch = await fetch('/assets/js/concat_'+whereFrom+'.json')
        , concatArr = await concatFetch.json()
        , respStr = ""
        , paths = [];
        if (fromNum === null) {
            fromNum = concatArr[fromStr];
        }
        if (toNum === null) {
            toNum = concatArr[toStr];
        }
        if (fromNum === undefined || isNaN(parseInt(fromNum))) {
            $("#search_res").html("<hr>В "+((whereFrom=="dush")?"Душе":"Степях")+" не найдена такая начальная локация.");
            return;
        }
        if (toNum === undefined || isNaN(parseInt(toNum))) {
            $("#search_res").html("<hr>В "+((whereFrom=="dush")?"Душе":"Степях")+" не найдена такая конечная локация.");
            return;
        }
        console.log(toNum)
        if (!Array.isArray(fromNum)) {
            fromNum = [parseInt(fromNum)];

        } 
        if (!Array.isArray(toNum)) {
            toNum = [parseInt(toNum)];

        }
        if (toNum == fromNum && toNum.length == 1) {
            $("#search_res").html("<hr>Вы уже находитесь в этой локации.");
            return;
        }

        if (fromNum.length > 1 || toNum.length > 1) {
            respStr = "<i>Минимум одна из локаций здесь дублируется (т.е. в "+((whereFrom=="dush")?"Душе":"Степях")+" больше одной локации с такими переходами).</i><br>";
        }
        fromNum.forEach(function callback(valFrom) { 
            toNum.forEach(function callback(valTo) {
                if (valFrom != valTo) {
                    paths.push({"from" : valFrom, "to" : valTo});
                }
            });
        });
        paths.forEach(function callback(path, pathIndex) {
            let ended = false 
            , tree = [] 
            , treeLvl = 0 
            , went = [path.from] 
            , completePath = []; 
            tree[0] = {[path.from] : -1}; 
            respStr += "<div id='search-header'><p align=center><b>[ "+(whereFrom=="dush"?"Душевая":"Степи")+" ] Путь из локации "+path.from+" в локацию "+path.to+"</b></p></div>";
            respStr += "<div id='search-table'>"; 
            pathingLoop:
                while (!ended) {
                    tree[treeLvl+1] = []; 
                    for (var lookedLoc in tree[treeLvl]) { 
                        for (var moveID in pathArr[lookedLoc]) { 
                            let foundMove = pathArr[lookedLoc][moveID].to; 
                            if (went.indexOf(foundMove) === -1) { 
                                tree[treeLvl+1][foundMove] = parseInt(lookedLoc); 
                                went.push(foundMove); 
                                if (foundMove == path.to) { 
                                    break pathingLoop;
                                }
                            }
                        }
                    }
                    treeLvl++;
                    if (!tree[treeLvl].length) {
                        ended = true; 
                        respStr += "<br>Не надо так. Я даже не знаю, как это получилось.";
                    }
                }
            if (!ended) { 
                completePath[treeLvl+1] = path.to; 
                completePath[treeLvl] = tree[treeLvl+1][path.to];
                let curr = completePath[treeLvl];
                while (treeLvl > 1) {
                    completePath[treeLvl-1] = tree[treeLvl][curr];
                    curr = completePath[treeLvl-1];
                    treeLvl--;
                }
                completePath[0] = path.from; 
            }
            for (let i = 0; i < completePath.length; i++) {
                let thisLoc = pathArr[completePath[i]] 
                , thisLocXY = {}; 
                for (var elem in thisLoc) {
                    thisLocXY[thisLoc[elem].x + '' + thisLoc[elem].y] = thisLoc[elem].to;
                }
                respStr += "<div class=\"search\">"; 
                respStr += (i != completePath.length - 1) ? "Из "+completePath[i]+" в "+completePath[i+1] : "Локация "+completePath[i];
                respStr += "<br>";
                respStr += "<table class=\"path pathfind-table\">";
                for (let row = 0; row < 6; row++) {
                    respStr += "<tr>";
                    for (let col = 0; col < 10; col++) {
                        let cell = col + '' + row;
                        respStr += "<td class=\"";
                        respStr += (thisLocXY[cell] === undefined) ? " unlit" : " lit";
                        if (i != completePath.length - 1 && thisLocXY[cell] == completePath[i+1]) {
                            respStr += " dawey";
                        }
                        respStr += "\">";
                        if (thisLocXY[cell] !== undefined) {
                           respStr += "<div class=\"loc_num\">в "+thisLocXY[cell]+"</div>";
                        }
                        respStr += "</td>";
                    }
                    respStr += "</tr>";
                }
                respStr += "</table></div>";
            }
            respStr += "</div>"; 
        });
        $("#search_res").html(respStr);
    }
	$('#sFind').click(function(){
		let f_num = $("#from_chk").prop("checked")?$("#from_num").val():null
		, t_num = $("#to_chk").prop("checked")?$("#to_num").val():null
		, f_str = $("#f_id").val()
		, t_str = $("#t_id").val();


		pathing(f_str, t_str, f_num, t_num);

		if ($(document).width()<=1000) {
             $("html, body").animate({scrollTop:$("#search_res").offset().top}, "slow");
 		}
		return false;
	});
	$('#sShow').click(function(){
		drawing($("#sh_loc").val())
		return false;
	});
	// Изменённый обработчик для чекбоксов в таблицах f_tbl и t_tbl
	$('#f_tbl input[type=checkbox], #t_tbl input[type=checkbox]').on('change', function() {
		let tableId = $(this).closest('table').attr('id'); // f_tbl или t_tbl
		let val = "";
		$("#" + tableId + " input[type=checkbox]:checked").each(function() {
			val += $(this).attr('id').replace(/\D/g, "");
		});
		let hiddenId = tableId.charAt(0) + "_id"; // f_id или t_id
		$('#' + hiddenId).val(val);
	});

	// Дополнительный обработчик для label, чтобы при клике на label обновлялся hidden input
	$('.search label').on('click', function() {
		let inputId = $(this).attr('for');
		let $input = $('#'+inputId);
		setTimeout(() => {
			$input.trigger('change');
		}, 0);
	});
	$('input[name="c1"]').on('change', function() {
		whereFrom = $(this).attr('id');
		let val = (whereFrom=="dush") ? 699 : 100;
		$('#sh_loc, #from_num, #to_num').attr({
		       "max" : val,
		       "placeholder" : val,
	    	}).val("");
	});
	$('.clear').on('click', function() {
		$("#"+$(this).attr('clear')+" input:checked").prop("checked", false);
	});
	$('#sh_loc').on('input', function(e) {
	});
	$("body").on("change paste keyup", "#from_num, #to_num", function() {
	    let id = "#"+$(this).attr("id").split("_")[0]+"_chk"
	    , state = $(this).val()?true:false;
	    $(id).prop("checked", state);
	});
});
