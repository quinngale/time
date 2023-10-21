const OPTIONS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

class SplitFlap {
    #options = [];
    #currentValue = 0;
    #display = null;

    #dynamic = null;

    #flaps = {};

    #lock = false;

    constructor(options) {
        if (typeof options != typeof []) {
            throw new TypeError("Variable 'options' is not an array or string");
        }

        this.#options = options;

        let container = document.createElement('div');
        let top_flap = document.createElement('div');
        let bottom_flap = document.createElement('div');
        let flap_flap = document.createElement('div');
        let flap_flap_front = document.createElement('div');
        let flap_flap_back = document.createElement('div');

        flap_flap.append(flap_flap_front, flap_flap_back);
        container.append(top_flap, bottom_flap, flap_flap);

        container.classList.add('dial');
        top_flap.classList.add('flap', 'top');
        bottom_flap.classList.add('flap', 'bottom');
        flap_flap.classList.add('dynamic');
        flap_flap_front.classList.add('flap', 'front', 'top');
        flap_flap_back.classList.add('flap', 'back', 'bottom');

        this.#dynamic = flap_flap;
        this.#flaps.top = top_flap;
        this.#flaps.bottom = bottom_flap;
        this.#flaps.dynamic = {};
        this.#flaps.dynamic.front = flap_flap_front;
        this.#flaps.dynamic.back = flap_flap_back;

        this.#display = container;

        this.setDisplay();
    }

    setDisplay() {
        let index = this.#currentValue;
        let length = this.#options.length;
        let currentValue = this.#options[index % length];
        let nextValue = this.#options[(index + 1) % length];

        this.#flaps.top.innerHTML = nextValue;
        this.#flaps.bottom.innerHTML = currentValue;
        this.#flaps.dynamic.front.innerHTML = currentValue;
        this.#flaps.dynamic.back.innerHTML = nextValue;
    }

    getValue() {
        let length = this.#options.length;
        let index = this.#currentValue;

        return this.#options[index % length];
    }

    nextValue() {
        this.#currentValue++;
        this.setDisplay();
    }

    async flip() {
        if (this.#lock) {
            console.warn("locked");
            return;
        };

        let returnValue = new Promise((resolve, _reject) => {
            this.#display.classList.add('flipping');

            this.#dynamic.onanimationend = () => {
                this.nextValue();
                this.#display.classList.remove('flipping');

                setTimeout(() => resolve(this.getValue()), 0);
            }
        });

        return returnValue;
    }

    async flipTo(value) {
        let returnValue = new Promise(async (resolve, _reject) => {
            let currentValue = this.getValue();
            while (currentValue != value) {
                currentValue = await this.flip();
            }
            resolve(this.getValue());
        });

        return returnValue;
    }

    appendTo(parentElement) {
        parentElement.append(this.#display);
    }
}

const init = () => {
    let flaps = [];

    for (let i = 0; i < 4; i++) {
        flaps.push(new SplitFlap(OPTIONS));
    }

    return [flaps];
}

let [flaps] = init();

window.onload = async () => {
    const main = document.querySelector('main');

    for (let i in flaps) {
        flaps[i].appendTo(main);
        if (i == 1) main.append(':');
    }

    main.ondblclick = (e) => {
        if (!document.fullscreenElement) main.requestFullscreen({ navigationUI: "show" });
        else document.exitFullscreen();

        e.preventDefault();
    }

    setInterval(() => {
        const now = new Date();

        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = now.getMinutes().toString().padStart(2, '0');

        let time = hours + minutes;

        main.setAttribute('aria-label', `${hours}:${minutes}`);
        document.title = `${hours}:${minutes}`;

        for (let i in flaps) {
            flaps[i].flipTo(time[i]);
        }
    }, 1000);
}