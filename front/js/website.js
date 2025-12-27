// 网站主页 JavaScript
class Website {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.initScrollEffects();
        this.initMobileMenu();
    }

    // 绑定事件
    bindEvents() {
        // 平滑滚动到锚点
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // 演示按钮交互
        document.querySelectorAll('.demo-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showDemoInteraction(btn);
            });
        });

        // 导航栏滚动效果
        window.addEventListener('scroll', () => {
            this.handleNavbarScroll();
            this.updateActiveNavLink();
        });
    }

    // 初始化滚动效果
    initScrollEffects() {
        // 创建 Intersection Observer 用于动画
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // 观察需要动画的元素
        document.querySelectorAll('.feature-card, .philosophy-item, .demo-step').forEach(el => {
            observer.observe(el);
        });
    }

    // 初始化移动端菜单
    initMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });

            // 点击菜单项后关闭菜单
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                });
            });
        }
    }

    // 处理导航栏滚动效果
    handleNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        }
    }

    // 更新活跃的导航链接
    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // 演示交互效果
    showDemoInteraction(btn) {
        // 移除其他按钮的活跃状态
        document.querySelectorAll('.demo-btn').forEach(b => {
            b.classList.remove('active');
        });

        // 添加当前按钮的活跃状态
        btn.classList.add('active');

        // 模拟响应
        setTimeout(() => {
            this.showDemoResponse(btn.textContent);
        }, 500);
    }

    // 显示演示响应
    showDemoResponse(buttonText) {
        const demoBody = document.querySelector('.demo-body');
        if (!demoBody) return;

        // 创建响应消息
        const response = document.createElement('div');
        response.className = 'demo-message bot';
        response.innerHTML = `
            <div class="message-avatar">🌸</div>
            <div class="message-content">
                <p>${this.getDemoResponse(buttonText)}</p>
            </div>
        `;

        // 添加到演示区域
        demoBody.appendChild(response);

        // 滚动到底部
        setTimeout(() => {
            response.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        // 3秒后移除响应
        setTimeout(() => {
            if (response.parentNode) {
                response.remove();
            }
        }, 3000);
    }

    // 获取演示响应文本
    getDemoResponse(buttonText) {
        const responses = {
            '🌅 开始每日启动': '太好了！让我们先回顾一下昨天的美好时光，然后规划今天最重要的三件事～',
            '💚 查看我的小动物': '你的小狐狸今天看起来很开心呢！它已经陪伴你3天了，正在慢慢长大 🦊✨',
            '📝 今天的self-care': '根据你的心情，我推荐：深呼吸5分钟、喝一杯温水、给自己一个拥抱 🤗'
        };

        return responses[buttonText] || '我会根据你的需求提供个性化的温柔建议 🌸';
    }

    // 添加页面加载动画
    addLoadingAnimation() {
        document.body.classList.add('loading');
        
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.body.classList.remove('loading');
                document.body.classList.add('loaded');
            }, 500);
        });
    }

    // 添加打字机效果
    typeWriter(element, text, speed = 50) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }

    // 添加数字计数动画
    animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        }
        
        updateCounter();
    }

    // 添加视差滚动效果
    initParallax() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
}

// 添加 CSS 动画类
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: slideInUp 0.6s ease forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .demo-btn.active {
        background: var(--primary-light);
        border-color: var(--primary-color);
        transform: scale(0.98);
    }
    
    .loading {
        overflow: hidden;
    }
    
    .loading * {
        animation-play-state: paused;
    }
    
    .loaded .hero-content {
        animation: fadeInUp 1s ease forwards;
    }
    
    .loaded .floating-animals {
        animation: fadeIn 1.5s ease 0.5s forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    /* 移动端菜单样式 */
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 70px;
            left: -100%;
            width: 100%;
            height: calc(100vh - 70px);
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            padding-top: 2rem;
            transition: left 0.3s ease;
        }
        
        .nav-menu.active {
            left: 0;
        }
        
        .nav-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .nav-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .nav-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
`;
document.head.appendChild(style);

// 初始化网站
document.addEventListener('DOMContentLoaded', () => {
    new Website();
});

// 导出到全局作用域
window.Website = Website;