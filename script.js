function addCard(){
	// create the cards
	var newBox = document.createElement('div'); //make new
	newBox.classList.add('box'); //label as a box (for css!)

	// NEW: little "-" delete button in the top right of every card
	var deleteBtn = document.createElement('button');
	deleteBtn.classList.add('deleteCardBtn');
	deleteBtn.textContent = '\u2212'; // minus sign
	deleteBtn.setAttribute('aria-label', 'Delete card');
	deleteBtn.type = 'button';

	//make the inner html structure of the boxes
	var colorCodeDiv = document.createElement('div'); 
	colorCodeDiv.textContent = '(r,g,b)';
	colorCodeDiv.classList.add('colorCode');
	var boxColorDiv = document.createElement('div'); 
	boxColorDiv.classList.add('boxColor');
	var hexcodeDiv = document.createElement('div');
	hexcodeDiv.textContent = '#FFFFFF';
	hexcodeDiv.classList.add('hexcode');

	//add the inner structure to the box so it is the same as the others
	newBox.appendChild(deleteBtn);
	newBox.appendChild(colorCodeDiv);
	newBox.appendChild(hexcodeDiv);
	newBox.appendChild(boxColorDiv); 

	document.querySelector('.container').appendChild(newBox); //add the new box to the container!
	return newBox; // NEW: callers (saved-color click, etc.) need a handle on the box they just made
}

function generateRandomColor(){
	const r = Math.floor(Math.random() * 256);
	const g = Math.floor(Math.random() * 256);
	const b = Math.floor(Math.random() * 256);
	return {r, g, b};
}

function rgbToHex(r, g, b) {
	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function reorderBoxes(){
	// reorder the boxes based on color values
	//should i do this by hex
	var container = document.querySelector('.container');
	var boxes = Array.from(container.children);

	console.log(boxes);

	boxes.sort((a, b) => {
		const colorA = a.querySelector('.hexcode');
		const colorB = b.querySelector('.hexcode');
		return colorA.textContent.localeCompare(colorB.textContent);
	});

	//boxes array is now sorted
	console.log(boxes);
	//clear container and re-add in order
	for(let i = container.children.length - 1; i >= 0; i--){
		container.removeChild(container.children[i]);
	}

	boxes.forEach(box => {
		container.appendChild(box);
	});	

}

// ---- shared helpers ----

// standard HSL -> RGB conversion (hand-written, double check against MDN if unsure)
function hslToRgb(h, s, l) {
	s /= 100; l /= 100;
	const k = n => (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
	return {
		r: Math.round(f(0) * 255),
		g: Math.round(f(8) * 255),
		b: Math.round(f(4) * 255)
	};
}

// standard RGB -> HSL conversion, used to pull a base hue out of the first card's color
function rgbToHsl(r, g, b){
	r /= 255; g /= 255; b /= 255;
	const max = Math.max(r, g, b), min = Math.min(r, g, b);
	let h, s, l = (max + min) / 2;
	if(max === min){
		h = s = 0;
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch(max){
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h *= 60;
	}
	return {h, s: s * 100, l: l * 100};
}

function hexToRgb(hex){
	hex = hex.replace('#', '');
	if(hex.length === 3){
		hex = hex.split('').map(c => c + c).join('');
	}
	const bigint = parseInt(hex, 16);
	return {
		r: (bigint >> 16) & 255,
		g: (bigint >> 8) & 255,
		b: bigint & 255
	};
}

function getBoxes(){
	return document.querySelectorAll('.container .box');
}

// reads color currently sitting in the first card,
// so the palette functions build off of it instead of a random one
function getBaseColorFromFirstCard(){
	const boxes = getBoxes();
	if(boxes.length === 0){
		return generateRandomColor();
	}
	const hex = boxes[0].querySelector('.hexcode').textContent;
	return hexToRgb(hex);
}

// sets a single box's displayed color
function setBoxColor(box, color){
	const boxColorDiv = box.querySelector('.boxColor');
	const hexcodeDiv = box.querySelector('.hexcode');
	const colorCodeDiv = box.querySelector('.colorCode');
	boxColorDiv.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
	colorCodeDiv.textContent = `(${color.r}, ${color.g}, ${color.b})`;
	hexcodeDiv.textContent = rgbToHex(color.r, color.g, color.b);
}

// applies a list of {r,g,b} colors to the current boxes, cycling if needed
function applyColorsToBoxes(colors){
	const boxes = getBoxes();
	boxes.forEach((box, i) => {
		setBoxColor(box, colors[i % colors.length]);
	});
}

function achromatic(){
	// black gray white
	// r = g = b
	// NOTE: first card's color is now the seed - it's kept as-is, the rest spread out as grays
	const count = getBoxes().length;
	const mainColor = getBaseColorFromFirstCard();
	const colors = [mainColor];
	for(let i = 1; i < count; i++){
		const value = count > 1 ? Math.round((255 / (count - 1)) * i) : 128;
		colors.push({r: value, g: value, b: value});
	}
	applyColorsToBoxes(colors);
}

function analogous(){
	// colors next to each other on the color wheel
	// NOTE: base hue now comes from the first card instead of rng
	const count = getBoxes().length;
	const mainColor = getBaseColorFromFirstCard();
	const baseHue = rgbToHsl(mainColor.r, mainColor.g, mainColor.b).h;
	const spread = 30;
	const colors = [mainColor];
	for(let i = 1; i < count; i++){
		const offset = count > 1 ? (-spread + (2 * spread) * (i / (count - 1))) : 0;
		const hue = (baseHue + offset + 360) % 360;
		colors.push(hslToRgb(hue, 70, 50));
	}
	applyColorsToBoxes(colors);
}

function complementary(){
	// pair of colors with max contrast
	// NOTE: main color now comes from the first card instead of rng
		// add in neutrals depending on number of colors
			// 3 colors = 1 TRUE neutral between the pair (red, green, a color between)
			// 4 colors = 2 neutrals with each complement (red, green, neutral red, neutral green)
			// 5 colors = 2 neutrals with each complement + 1 TRUE neutral (red, green, neutral red, neutral green, true neutral)

	const count = getBoxes().length;
	let mainColor = getBaseColorFromFirstCard();
	let complementColor = {
		r: 255 - mainColor.r,
		g: 255 - mainColor.g,
		b: 255 - mainColor.b
	};
	const neutralOf = (c) => ({
		r: Math.round((c.r + 128) / 2),
		g: Math.round((c.g + 128) / 2),
		b: Math.round((c.b + 128) / 2)
	});
	const trueNeutral = {
		r: Math.round((mainColor.r + complementColor.r) / 2),
		g: Math.round((mainColor.g + complementColor.g) / 2),
		b: Math.round((mainColor.b + complementColor.b) / 2)
	};

	let colors = [mainColor, complementColor];
	if(count === 3){
		colors = [mainColor, complementColor, trueNeutral];
	} else if(count === 4){
		colors = [mainColor, complementColor, neutralOf(mainColor), neutralOf(complementColor)];
	} else if(count >= 5){
		colors = [mainColor, complementColor, neutralOf(mainColor), neutralOf(complementColor), trueNeutral];
		// ASSUMPTION: comments didn't specify 6+, extras cycle the 5-color set
		while(colors.length < count){
			colors.push(colors[colors.length % 5]);
		}
	}
	applyColorsToBoxes(colors);
}

function monochromatic(){
	// one hue/color, vary the tones
	// NOTE: hue now comes from the first card instead of rng
	const count = getBoxes().length;
	const mainColor = getBaseColorFromFirstCard();
	const hue = rgbToHsl(mainColor.r, mainColor.g, mainColor.b).h;
	const colors = [mainColor];
	for(let i = 1; i < count; i++){
		const lightness = count > 1 ? 20 + (60 * (i / (count - 1))) : 50;
		colors.push(hslToRgb(hue, 60, lightness));
	}
	applyColorsToBoxes(colors);
}

function splitComplementary(){
	// max contrast, grab one of the pair and split it equally
	// NOTE: base hue now comes from the first card instead of rng
	const count = getBoxes().length;
	const mainColor = getBaseColorFromFirstCard();
	const baseHue = rgbToHsl(mainColor.r, mainColor.g, mainColor.b).h;
	const complementHue = (baseHue + 180) % 360;
	const anchors = [baseHue, (complementHue - 30 + 360) % 360, (complementHue + 30) % 360];

	// ASSUMPTION: boxes beyond the 3 anchors repeat them at stepped-down lightness
	const colors = [mainColor];
	for(let i = 1; i < count; i++){
		const hue = anchors[i % anchors.length];
		const lightness = 50 - (10 * Math.floor(i / anchors.length));
		colors.push(hslToRgb(hue, 70, Math.max(20, lightness)));
	}
	applyColorsToBoxes(colors);
}

function triadic(){
	// 3 equal distance colors
	// NOTE: base hue now comes from the first card instead of rng
	const count = getBoxes().length;
	const mainColor = getBaseColorFromFirstCard();
	const baseHue = rgbToHsl(mainColor.r, mainColor.g, mainColor.b).h;
	const anchors = [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];

	const colors = [mainColor];
	for(let i = 1; i < count; i++){
		const hue = anchors[i % anchors.length];
		const lightness = 50 - (10 * Math.floor(i / anchors.length));
		colors.push(hslToRgb(hue, 70, Math.max(20, lightness)));
	}
	applyColorsToBoxes(colors);
}

function tetradic(){
	// 4 equal distance colors
	// NOTE: base hue now comes from the first card instead of rng
	const count = getBoxes().length;
	const mainColor = getBaseColorFromFirstCard();
	const baseHue = rgbToHsl(mainColor.r, mainColor.g, mainColor.b).h;
	const anchors = [baseHue, (baseHue + 90) % 360, (baseHue + 180) % 360, (baseHue + 270) % 360];

	const colors = [mainColor];
	for(let i = 1; i < count; i++){
		const hue = anchors[i % anchors.length];
		const lightness = 50 - (10 * Math.floor(i / anchors.length));
		colors.push(hslToRgb(hue, 70, Math.max(20, lightness)));
	}
	applyColorsToBoxes(colors);
}

// ---- saved color "tic tac" strip ----

// creates the strip above the cards if it isn't already there, so no HTML edit is required
function ensureSavedColorsContainer(){
	let saved = document.querySelector('.savedColors');
	if(!saved){
		saved = document.createElement('div');
		saved.classList.add('savedColors');
		const container = document.querySelector('.container');
		container.parentNode.insertBefore(saved, container);
	}
	return saved;
}

function saveColorAsTicTac(hex){
	const savedContainer = ensureSavedColorsContainer();
	const tictac = document.createElement('div');
	tictac.classList.add('tictac');
	tictac.style.backgroundColor = hex;
	tictac.style.width = '14px';
	tictac.style.height = '14px';
	tictac.style.borderRadius = '50%';
	tictac.style.display = 'inline-block';
	tictac.style.margin = '4px';
	tictac.style.border = '1px solid #333';
	tictac.style.cursor = 'pointer';
	tictac.dataset.color = hex;
	// clicking the tic tac unsaves it AND spawns a new card in that color
	tictac.addEventListener('click', function(){
		const rgb = hexToRgb(tictac.dataset.color);
		const newBox = addCard();
		setBoxColor(newBox, rgb);
		tictac.remove();
	});
	savedContainer.appendChild(tictac);
}


//note to self: the copilot AI suggestions are helpful but not always the intent, read through them carefully!

document.querySelector('.generateBtn').addEventListener('click', function(){
	const boxes = document.querySelectorAll('.box');
	//currently this will just generate random colors for each box
		//will update to implement each color theory function later
	boxes.forEach(box => {
		const color = generateRandomColor();
		const boxColorDiv = box.querySelector('.boxColor');
		const hexcodeDiv = box.querySelector('.hexcode');
		const colorCodeDiv = box.querySelector('.colorCode');
		boxColorDiv.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
		colorCodeDiv.textContent = `(${color.r}, ${color.g}, ${color.b})`;
		hexcodeDiv.textContent = rgbToHex(color.r, color.g, color.b);
		console.log(color);
	});
});

document.querySelector('.addCardBtn').addEventListener('click', function(){
	addCard();
});

document.querySelector('.reorderBtn').addEventListener('click', function(){
	reorderBoxes();
});

document.querySelector('.achromaticBtn').addEventListener('click', achromatic);
document.querySelector('.analogousBtn').addEventListener('click', analogous);
document.querySelector('.complementaryBtn').addEventListener('click', complementary);
document.querySelector('.monochromaticBtn').addEventListener('click', monochromatic);
document.querySelector('.splitComplementaryBtn').addEventListener('click', splitComplementary);
document.querySelector('.triadicBtn').addEventListener('click', triadic);
document.querySelector('.tetradicBtn').addEventListener('click', tetradic);

// tracks whether the mouse-up that follows a drag should be allowed to
// fall through into the container's click handler (save color / delete)
let suppressCardClick = false;

// clicking a card saves its color as a tic tac above the cards,
// or deletes the card if the click landed on its "-" button
// (event delegation on .container so this also works for cards added later via addCard)
document.querySelector('.container').addEventListener('click', function(event){
	if(suppressCardClick){
		// this click is the tail end of a drag, not a real click - ignore it once
		suppressCardClick = false;
		return;
	}

	const deleteBtn = event.target.closest('.deleteCardBtn');
	if(deleteBtn){
		deleteBtn.closest('.box').remove();
		return;
	}

	const box = event.target.closest('.box');
	if(!box) return;
	const hex = box.querySelector('.hexcode').textContent;
	saveColorAsTicTac(hex);
});

// ---- drag-and-drop card reordering ----
// pointer-based (mousedown/mousemove/mouseup) rather than native HTML5 drag-and-drop,
// so the dragged card can grow and follow the cursor smoothly instead of using the
// browser's default drag ghost image

(function enableCardDragging(){
	const container = document.querySelector('.container');
	const DRAG_THRESHOLD = 5; // px of movement before a click becomes a drag

	let draggedBox = null;
	let isDragging = false;
	let startX = 0, startY = 0;
	let grabOffsetX = 0, grabOffsetY = 0;

	container.addEventListener('mousedown', function(event){
		// dragging starts from anywhere on the card except its delete button
		if(event.target.closest('.deleteCardBtn')) return;
		const box = event.target.closest('.box');
		if(!box) return;

		draggedBox = box;
		isDragging = false;
		startX = event.clientX;
		startY = event.clientY;

		const rect = box.getBoundingClientRect();
		grabOffsetX = event.clientX - rect.left;
		grabOffsetY = event.clientY - rect.top;

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	});

	function onMouseMove(event){
		if(!draggedBox) return;

		const dx = event.clientX - startX;
		const dy = event.clientY - startY;

		if(!isDragging){
			if(Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;

			// movement crossed the threshold - this is officially a drag now.
			// pull the card out of the flex flow and pin its current size so
			// it doesn't collapse/resize when it goes to position: fixed
			isDragging = true;
			const rect = draggedBox.getBoundingClientRect();
			draggedBox.style.width = `${rect.width}px`;
			draggedBox.style.height = `${rect.height}px`;
			draggedBox.style.position = 'fixed';
			draggedBox.classList.add('dragging');
			document.body.style.userSelect = 'none';
		}

		draggedBox.style.left = `${event.clientX - grabOffsetX}px`;
		draggedBox.style.top = `${event.clientY - grabOffsetY}px`;

		// figure out where the card should land among its siblings, and
		// physically move it in the DOM - the flex container reflows the
		// rest of the cards into place automatically
		const siblings = Array.from(container.children).filter(el => el !== draggedBox);
		let insertBefore = null;

		for(const sib of siblings){
			const sibRect = sib.getBoundingClientRect();
			const inSameRow = event.clientY >= sibRect.top && event.clientY <= sibRect.bottom;
			const sibCenterX = sibRect.left + sibRect.width / 2;
			const sibCenterY = sibRect.top + sibRect.height / 2;

			if(inSameRow ? event.clientX < sibCenterX : event.clientY < sibCenterY){
				insertBefore = sib;
				break;
			}
		}

		if(insertBefore){
			container.insertBefore(draggedBox, insertBefore);
		} else {
			container.appendChild(draggedBox);
		}
	}

	function onMouseUp(){
		if(draggedBox && isDragging){
			// the browser will still fire a native 'click' right after this -
			// suppress just that one so a drag doesn't also save/delete the card
			suppressCardClick = true;

			draggedBox.classList.remove('dragging');
			draggedBox.style.position = '';
			draggedBox.style.left = '';
			draggedBox.style.top = '';
			draggedBox.style.width = '';
			draggedBox.style.height = '';
			document.body.style.userSelect = '';
		}

		draggedBox = null;
		isDragging = false;
		document.removeEventListener('mousemove', onMouseMove);
		document.removeEventListener('mouseup', onMouseUp);
	}
})();

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('color-wheel');
	const clearCanvas = document.getElementById('clear-wheel');
    const ctx = canvas.getContext('2d');
	const clearCtx = clearCanvas.getContext('2d');
    const colorCodeInput = document.getElementById('color-code');
    const colorSwatch = document.querySelector('.color-swatch');
    const size = canvas.width;
    const center = size / 2;
    const radius = size / 2;
	document.getElementById('clear-wheel').style.cursor = "none";

    // Function to draw the color wheel on the canvas -- googled and adapted to model
    function drawColorWheel() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const x = i - center;
                const y = j - center;
                const angle = Math.atan2(y, x);
                const distance = Math.sqrt(x * x + y * y);

                if (distance <= radius) {
                    const hue = angle * 180 / Math.PI;
                    // Hue goes from -180 to 180, adjust to 0-360
                    const adjustedHue = (hue + 360) % 360; 
                    const saturation = (distance / radius) * 100;
                    const lightness = 50; // Keep lightness at 50% for full saturation

                    ctx.fillStyle = `hsl(${adjustedHue}, ${saturation}%, ${lightness}%)`;
                    ctx.fillRect(i, j, 1, 1);
                }
            }
        }
    }

    // Function to get color under the cursor and update display
		//To do: adjust this to be an active selection rather than on click
    function pickColor(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const imageData = ctx.getImageData(x, y, 1, 1).data;
        const rgb = { r: imageData[0], g: imageData[1], b: imageData[2] };
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

        colorCodeInput.value = hex;
        colorSwatch.style.backgroundColor = hex;

        // NEW: the picked color now also lands in the first card
        const boxes = getBoxes();
        if(boxes.length > 0){
            setBoxColor(boxes[0], rgb);
        }
    }
	function hoverCircle(event){
		const circle = clearCanvas.getBoundingClientRect();
		const x = event.clientX - circle.left;
		const y = event.clientY - circle.top;
		const radius = 10; // Radius of the hover circle
		clearCtx.clearRect(0, 0, clearCanvas.width, clearCanvas.height); // NO MORE CIRCLE TRAIL
		clearCtx.beginPath();

		clearCtx.arc(x, y, radius, 0, 2 * Math.PI);
		clearCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
		clearCtx.lineWidth = 2;
		const imageData = ctx.getImageData(x, y, 1, 1).data;
        const rgb = { r: imageData[0], g: imageData[1], b: imageData[2] };
		clearCtx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
		clearCtx.stroke();
	}

    // Event listener for mouse clicks on the canvas
    clearCanvas.addEventListener('mousemove', hoverCircle);
	clearCanvas.addEventListener('click', pickColor);

    drawColorWheel();
});