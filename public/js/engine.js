var colorTable = {
	0: 'red',
	1: 'green',
	2: 'blue',
	3: 'magenta',
	4: 'yellow',
	5: 'orange',
};
var clicks = 0;
var points = 0;

/* Add jquery function for getting/changing color */
$.fn.extend({
			getColor: function(){
				return this.attr('class').split(' ')[1];
			},
			setColor: function(color){
			/*
				x = this.data('x');
				y = this.data('y');
				console.log('Changing: '+x+','+y+' to '+color);
				*/
				return this.each( function(){
					$(this).removeClass($(this).getColor()).addClass(color);
				});
			},
			getNeighbours: function(){
				x = this.data('x');
				y = this.data('y');
				var neighbours = '';
				if(x != 0){
					neighbours += '#x'+(x-1)+'y'+y+', ';
				}
				if(y != 0){
					neighbours += '#x'+x+'y'+(y-1)+', ';
				}
				if(x != 13){
					neighbours += '#x'+(x+1)+'y'+y+', ';
				}
				if(y != 13){
					neighbours += '#x'+x+'y'+(y+1);
				}
				return this.siblings(neighbours);
			},
			checkChangeRec: function(oldColor, newColor){
												/*
				x = this.data('x');
				y = this.data('y');
				console.log('Checking: '+x+','+y);
				*/
				return this.each( function(){
					if($(this).getColor() == oldColor){
						$(this).setColor(newColor);
						$(this).getNeighbours().checkChangeRec(oldColor, newColor);
					}
				});
			}
});

var clickedButton = function(newColor){
	var oldColor = $('#x0y0').getColor();
	if(oldColor != newColor){
		$('#x0y0').checkChangeRec(oldColor, newColor);
		clicks += 1;
		$('#clicks').html(clicks);
	}
	winCheck();
}


$('.button').live('click', function(){
	var newColor = $(this).getColor();
	clickedButton(newColor);
	
	});

/* Keyboard bindings */
$(document).bind('keydown', 'q', function(){clickedButton(colorTable[0]);});
$(document).bind('keydown', 'w', function(){clickedButton(colorTable[1]);});
$(document).bind('keydown', 'e', function(){clickedButton(colorTable[2]);});
$(document).bind('keydown', 'a', function(){clickedButton(colorTable[3]);});
$(document).bind('keydown', 's', function(){clickedButton(colorTable[4]);});
$(document).bind('keydown', 'd', function(){clickedButton(colorTable[5]);});

var startGame = function(){
	$('#playfield').html('');
	$.getJSON('/newGame', function(data){
		$.each(data, function(i, val){
			$('#playfield').append('<div id=x' + val.x +'y'+ val.y +' class="block ' + colorTable[val.value] + '"></div>');
			$('#x'+val.x+'y'+val.y).data({
				x: val.x,
				y: val.y,
			});
		});
	});
	clicks = 0;
	$('#clicks').html(clicks);
	/* (re)load highscore */
	$.getJSON('/highscore', function(data){
		$('#highscore .content').html('');
		$.each(data, function(i, val){
			$('#highscore .content').append('<div class="record"><span class="player">' + val.player + '</span><span class="score">' + val.score + '</span></div>');
		});
	});
}

var winFunction = function(){
	points += Math.pow(2, 26-clicks)*10;
	$('#points').html(points);
	$.ajax('/saveGame/1/' + clicks + '/' + points);
	startGame();
}

var loseFunction = function(){
	points = 0;
	$('#points').html(points);
	startGame();
}

var winCheck = function(){
	var color = $('#x0y0').getColor();
	var win = true;
	$('#playfield').children().each(function(){
		if($(this).getColor() != color){
			win = false;
		}
	});
	if(win){
		winFunction();
	}
	else if(clicks == 25){
		loseFunction();
	}
}
		

var mainLoop = function(){
	gLoop = setTimeout(mainLoop, 1000/50);
}

startGame();
mainLoop();
