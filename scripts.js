document.addEventListener('DOMContentLoaded', () => {
    const words = document.querySelectorAll('.word');
    const textContainer = document.getElementById('animated-text');

    // Show the text
    textContainer.style.opacity = 1;

    // Animate each word
    setTimeout(() => {
        words.forEach((word, index) => {
            const letters = word.innerText.split('');
            word.innerHTML = ''; // Clear the word

            letters.forEach((letter, letterIndex) => {
                const span = document.createElement('span');
                span.innerText = letter;
                span.style.display = 'inline-block';
                span.style.transition = `transform 0.5s ease ${index * 100 + letterIndex * 50}ms`;
                word.appendChild(span);

                // Move letters into position
                setTimeout(() => {
                    span.style.transform = 'translateX(-100%)';
                }, 100); // Delay to start the movement
            });

            // Hide the word after the animation
            setTimeout(() => {
                word.classList.add('show');
            }, (letters.length * 50) + (index * 100) + 500); // Total delay before hiding
        });
    }, 500); // Delay before starting the animation

    // Shift to horizontal after all animations
    setTimeout(() => {
        textContainer.classList.add('compress');
        textContainer.classList.add('horizontal');
    }, 2000); // Time after last letter animation to shift to horizontal
});