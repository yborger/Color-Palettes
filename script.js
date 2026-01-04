function addCard(){
	// create the cards
	var newBox = document.createElement('div'); //make new
	newBox.classList.add('box'); //label as a box (for css!)

	//make the inner html structure of the boxes
	var colorCodeDiv = document.createElement('div'); 
	colorCodeDiv.textContent = '(r,g,b)';
	colorCodeDiv.classList.add('colorCode');
	var boxColorDiv = document.createElement('div'); 
	boxColorDiv.classList.add('boxColor');

	//add the inner structure to the box so it is the same as the others
	newBox.appendChild(colorCodeDiv);
	newBox.appendChild(boxColorDiv); 

	document.querySelector('.container').appendChild(newBox); //add the new box to the container!
}

function removeCard(){
	// remove the cards
	var container = document.querySelector('.container'); 
	if(container.children.length > 0){
		container.removeChild(container.lastChild);
	}
}

function generateRandomColor(){
	const r = Math.floor(Math.random() * 256);
	const g = Math.floor(Math.random() * 256);
	const b = Math.floor(Math.random() * 256);
	return {r, g, b};
}

function achromatic(){
	// black gray white
	// r = g = b
	let x = 255 / container.children.length;
	


}

function analogous(){
	// colors next to each other on the color wheel
	// rng the main color, +- for adjacents

}

function complementary(){
	// pair of colors with max contrast
	// rng the main color, grab complement
		// add in neutrals depending on number of colors
			// 3 colors = 1 TRUE neutral between the pair (red, green, a color between)
			// 4 colors = 2 neutrals with each complement (red, green, neutral red, neutral green)
			// 5 colors = 2 neutrals with each complement + 1 TRUE neutral (red, green, neutral red, neutral green, true neutral)

		}

function monochromatic(){
	// one hue/color, vary the tones
	// rng color - code for achromatic will help here

}

function splitComplementary(){
	// max contrast, grab one of the pair and split it equally
	// rng main color, grab complement, split complement equally

}

function triadic(){
	// 3 equal distance colors
	// rng main color, continue the cycle
	
}

function tetradic(){
	// 4 equal distance colors
	// 	unsure how to implement

}


//note to self: the copilot AI suggestions are helpful but not always the intent, read through them carefully!

document.querySelector('.generateBtn').addEventListener('click', function(){
	const boxes = document.querySelectorAll('.box');
	//currently this will just generate random colors for each box
		//will update to implement each color theory function later
	boxes.forEach(box => {
		const color = generateRandomColor();
		const boxColorDiv = box.querySelector('.boxColor');
		const colorCodeDiv = box.querySelector('.colorCode');
		boxColorDiv.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
		colorCodeDiv.textContent = `(${color.r}, ${color.g}, ${color.b})`;
		console.log(color);
	});
});

document.querySelector('.addCardBtn').addEventListener('click', function(){
	addCard();
});

document.querySelector('.removeCardBtn').addEventListener('click', function(){
	removeCard();
});