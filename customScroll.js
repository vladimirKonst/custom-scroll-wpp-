import {debounce, sleep} from '../utils/utils';
import {animateScrollContent} from '../components/text-block-animations';
import "@babel/polyfill";

class CustomScroll {
    constructor(data) {
        this.activeScreenIdx = 0;
        this.scrollIdx = 0;
        this.footerShown = false;
        this.scrollDirection;
        this.screens = data.screens;
        this.footer = document.querySelector('footer');
        this.slideUpBtn = document.querySelector('.slide-up-btn');

        this.slideUpBtn.addEventListener('click', this.slideUpPage.bind(this, 150));
        if (window.innerWidth >= 1280 && !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
            this.init();
        }
    }

    init() {
        this.initPagination();
        this.checkScrollDirection();
    }

    initPagination() {
        this.createPginationtemplate();
    }

    createPginationtemplate() {
        let node = document.createElement('div');
        let counter = 0;

        // this.screens.length + 1 потому что есть еще 1 неполноценный экран-футер, его тоже нужно включить в пагинацию и обработать отдельно
        while (counter < this.screens.length + 1) {
            node.innerHTML += `<div class="scroll-pagination__item ${counter === 0 ? 'active' : ''}" id="n${counter + 1}"></div>`;
            counter++;
        }
        node.className = 'scroll-pagination';
        document.body.append(node);
    }

    setActivePaginationItem(index) {
        [...document.querySelectorAll('.scroll-pagination__item')].forEach((item) => {
            item.classList.remove('active');
        });
        document.querySelector(`#n${index}`).classList.add('active');
    }

    changeScreen() {
        let lastScrollIdx = this.scrollIdx;
        let directionUp = this.scrollDirection === 'up' && this.scrollIdx !== 0;
        let directionDown = this.scrollDirection === 'down' && this.scrollIdx < this.screens.length - 1;

        if (directionUp && !this.footerShown) {
            this.screens[this.scrollIdx].classList.remove('slide-in');
            this.scrollIdx--;
        } else if (directionDown && !this.footerShown) {
            this.scrollIdx++;
            this.screens[this.scrollIdx].classList.add('slide-in');
        }

        if (directionUp || directionDown) {
            this.setActivePaginationItem(this.scrollIdx + 1);
        }

        if (lastScrollIdx === this.scrollIdx && lastScrollIdx !== 0) {
            this.scrollFooter(this.scrollDirection);
        }

        let currentElement = directionDown ? this.screens[this.scrollIdx] : this.screens[this.scrollIdx + 1];
        animateScrollContent(this.scrollDirection, currentElement);
    }

    // метод для обработки скрола последнего экрана с футером
    scrollFooter(str) {
        this.footer = document.querySelector('footer');
        this.lastScreen = this.screens[this.screens.length - 1];
        let paginationSize = document.querySelectorAll('.scroll-pagination__item ').length;
        let footerHeight = this.footer.offsetHeight;
        let viewPortHeight = window.innerHeight;

        if (str === 'down') {
            this.footerShown = true;
            this.lastScreen.style.transform = `translateY(-${footerHeight + viewPortHeight}px)`;
            this.footer.style.transform = `translateY(-${footerHeight}px)`;
            this.setActivePaginationItem(paginationSize);
        } else if (str = 'up') {
            this.footerShown = false;
            this.lastScreen.style.transform = '';
            this.footer.style.transform = '';
            this.setActivePaginationItem(paginationSize - 1);
        }
    }

    checkScrollDirection() {
        window.onwheel = debounce((e) => {
            this.scrollDirection = e.wheelDelta || e.deltaY;
            if (this.scrollDirection > 0) {
                this.scrollDirection = 'up';
            } else {
                this.scrollDirection = 'down';
            }
            this.changeScreen();
        }, 50);
    }

    slideUpPage(time) {
        let reversedScreens = [...this.screens].reverse();
        let animatedBlocks =[...document.querySelectorAll('.content-animation__box')].reverse();

        this.lastScreen.style.transform = '';
        this.footer.style.transform = '';
        reversedScreens.forEach(async (item, index, arr) => {
            await sleep(time * index);
            this.setActivePaginationItem(arr.length - index);
            item.classList.remove('slide-in');
            let currentBlock = animatedBlocks[index];

            if (currentBlock) {
                currentBlock.classList.remove('content-animation__box');
                [...currentBlock.querySelectorAll('.content-animation-txt__active')].forEach((element) => {
                    element.classList.remove('content-animation-txt__active');
                })
            }
        });
        this.activeScreenIdx = 0;
        this.scrollIdx = 0;
        this.footerShown = false;
    }
}

export {CustomScroll};
