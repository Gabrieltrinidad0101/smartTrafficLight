export function addMenuButton({ svg, onclick }) {
    const element = window.document.querySelector(".flex.w-full.flex-col.items-center.gap-0")

    if (!element) return;

    const wrapper = document.createElement('div');

    // Create button
    const button = document.createElement('button');
    button.dataset.state = "closed";

    // Create link (a tag)
    const link = document.createElement('a');
    link.setAttribute('aria-current', 'page');
    link.className = "flex flex-col items-center justify-center rounded-lg mx-[10px] mb-4 font-bold text-white bg-selected hover:bg-selected/80";
    link.href = "#"; // Prevent navigation or set appropriately
    
    // Prevent default link behavior if onclick is provided
    link.addEventListener('click', (e) => {
        e.preventDefault();
        if (onclick) onclick(e);
    });

    // Inject SVG
    link.innerHTML = svg;

    button.appendChild(link);
    wrapper.appendChild(button);

    element.appendChild(wrapper);
}

