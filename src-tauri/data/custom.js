window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// 下载链接点击监听模块
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector('head base[target="_blank"]')

    if (origin && origin.hasAttribute('download')) {
        e.preventDefault(); 
        const fileName = origin.download || origin.href.split('/').pop();
        showDownloadTip('开始下载：' + fileName, 'loading');
        
        downloadFileWithCallback(origin.href, fileName, 
            () => showDownloadTip('下载成功：' + fileName, 'success'), 
            (err) => showDownloadTip('下载失败：' + fileName, 'error') 
        );
        return; 
    }

    console.log('origin', origin, isBaseTargetBlank)
    if ((origin && origin.href && origin.target === '_blank') || (origin && origin.href && isBaseTargetBlank)) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

// 重写window.open拦截下载模块
window.open = function (url, target, features) {
    console.log('open', url, target, features)
    const downloadExtensions = ['zip', 'rar', 'pdf', 'xlsx', 'docx', 'png', 'jpg', 'exe'];
    const fileExt = url.split('.').pop().toLowerCase();
    if (downloadExtensions.includes(fileExt)) {
        const fileName = url.split('/').pop();
        showDownloadTip('开始下载：' + fileName, 'loading');
        
        downloadFileWithCallback(url, fileName,
            () => showDownloadTip('下载成功：' + fileName, 'success'),
            (err) => showDownloadTip('下载失败：' + fileName, 'error')
        );
        return; 
    }
    location.href = url
}

// 下载文件并监听状态模块
function downloadFileWithCallback(url, fileName, successCb, errorCb) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`请求失败（状态码：${response.status}）`);
            }
            return response.blob(); 
        })
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            link.click();
            
            URL.revokeObjectURL(blobUrl);
            setTimeout(successCb, 500);
        })
        .catch(error => {
            errorCb(error.message);
        });
}

// 注入样式和创建右键菜单模块
function injectFaStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* 下载提示弹窗样式 */
        .popup {
          margin: 10px 0;
          box-shadow: 4px 4px 10px -10px rgba(0, 0, 0, 1);
          width: 300px;
          display: flex;
          align-items: center;
          padding: 10px 15px;
          border-radius: 4px;
          font-weight: 300;
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%) scale(0.9);
          opacity: 0;
          z-index: 999999;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          height: auto;
        }
        /* 弹窗SVG图标样式（统一控制） */
        .popup-icon svg.popup-icon-svg {
          width: 1.25rem; /* 和原FA图标大小一致 */
          height: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          fill: currentColor; /* 继承指定的颜色值 */
          flex-shrink: 0;
        }
        .popup-icon {
          margin-right: 10px;
        }
        .popup-message {
          flex: 1;
          white-space: normal;
          line-height: 1.4;
        }
        .success-popup {
          background-color: #edfbd8;
          border: solid 1px #84d65a;
        }
        .success-message {
          color: #2b641e;
        }
        .error-popup {
          background-color: #fef2f2;
          border: solid 1px #f87171;
        }
        .error-message {
          color: #991b1b;
        }
        .info-popup {
          background-color: #eff6ff;
          border: solid 1px #1d4ed8;
        }
        .info-message {
          color: #1d4ed8;
        }

        /* 自定义右键菜单样式 */
        #custom-contextmenu {
          position: fixed;
          width: 160px;
          background: #fff;
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          z-index: 9999999;
          display: none;
          padding: 8px 0;
          margin: 0;
          list-style: none;
        }
        #custom-contextmenu li {
          padding: 6px 16px;
          cursor: pointer;
          color: #333;
          font-size: 14px;
          display: flex;
          align-items: center;
          transition: background-color 0.2s ease;
        }
        #custom-contextmenu li:hover {
          background-color: #f0f0f0;
        }
        /* 统一SVG图标样式（所有菜单图标通用） */
        #custom-contextmenu li svg.menu-icon {
          width: 12px;
          height: 12px;
          margin-right: 8px;
          fill: currentColor; /* 继承文字颜色，hover同步变色 */
          flex-shrink: 0; /* 防止压缩变形 */
        }
    `;
    document.head.appendChild(style);

    if (!document.getElementById('custom-contextmenu')) {
        const contextMenu = document.createElement('ul');
        contextMenu.id = 'custom-contextmenu';
        // 菜单顺序：刷新页面、回到上页、回到首页
        contextMenu.innerHTML = `
            <li id="context-refresh">
                <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path d="M320 128C263.2 128 212.1 152.7 176.9 192L224 192C241.7 192 256 206.3 256 224C256 241.7 241.7 256 224 256L96 256C78.3 256 64 241.7 64 224L64 96C64 78.3 78.3 64 96 64C113.7 64 128 78.3 128 96L128 150.7C174.9 97.6 243.5 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C233 576 156.1 532.6 109.9 466.3C99.8 451.8 103.3 431.9 117.8 421.7C132.3 411.5 152.2 415.1 162.4 429.6C197.2 479.4 254.8 511.9 320 511.9C426 511.9 512 425.9 512 319.9C512 213.9 426 128 320 128z"/>
                </svg>
                刷新页面
            </li>
            <li id="context-back">
                <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path d="M73.4 297.4C60.9 309.9 60.9 330.2 73.4 342.7L233.4 502.7C245.9 515.2 266.2 515.2 278.7 502.7C291.2 490.2 291.2 469.9 278.7 457.4L173.3 352L544 352C561.7 352 576 337.7 576 320C576 302.3 561.7 288 544 288L173.3 288L278.7 182.6C291.2 170.1 291.2 149.8 278.7 137.3C266.2 124.8 245.9 124.8 233.4 137.3L73.4 297.3z"/>
                </svg>
                回到上页
            </li>
            <li id="context-home">
                <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path d="M409 337C418.4 327.6 418.4 312.4 409 303.1L265 159C258.1 152.1 247.8 150.1 238.8 153.8C229.8 157.5 224 166.3 224 176L224 256L112 256C85.5 256 64 277.5 64 304L64 336C64 362.5 85.5 384 112 384L224 384L224 464C224 473.7 229.8 482.5 238.8 486.2C247.8 489.9 258.1 487.9 265 481L409 337zM416 480C398.3 480 384 494.3 384 512C384 529.7 398.3 544 416 544L480 544C533 544 576 501 576 448L576 192C576 139 533 96 480 96L416 96C398.3 96 384 110.3 384 128C384 145.7 398.3 160 416 160L480 160C497.7 160 512 174.3 512 192L512 448C512 465.7 497.7 480 480 480L416 480z"/>
                </svg>
                回到首页
            </li>
        `;
        document.body.appendChild(contextMenu);

        // 绑定菜单点击事件
        document.getElementById('context-back').addEventListener('click', () => {
            history.back();
            hideContextMenu();
        });
        document.getElementById('context-home').addEventListener('click', () => {
            location.href = 'http://gxwl.nacon.site/'; 
            hideContextMenu();
        });
        document.getElementById('context-refresh').addEventListener('click', () => {
            location.reload();
            hideContextMenu();
        });
    }
}

// 显示自定义右键菜单模块
function showContextMenu(e) {
    e.preventDefault(); 
    
    const menu = document.getElementById('custom-contextmenu');
    menu.style.display = 'none';
    
    const x = e.clientX;
    const y = e.clientY;
    const viewWidth = document.documentElement.clientWidth;
    const viewHeight = document.documentElement.clientHeight;
    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;

    menu.style.left = (x + menuWidth > viewWidth ? x - menuWidth : x) + 'px';
    menu.style.top = (y + menuHeight > viewHeight ? y - menuHeight : y) + 'px';
    menu.style.display = 'block';
}

// 隐藏自定义右键菜单模块
function hideContextMenu() {
    const menu = document.getElementById('custom-contextmenu');
    menu.style.display = 'none';
}

// 下载提示弹窗模块（核心修改：替换所有图标为指定SVG）
function showDownloadTip(message, type) {
    const popup = document.createElement('div');
    popup.className = 'popup';

    const existingPopups = document.querySelectorAll('.popup');
    popup.style.top = `${20 + existingPopups.length * 70}px`;

    let popupClass = '';
    let popupIconSvg = ''; // 替换原faIcon为SVG字符串
    let messageClass = '';
    const colors = {
        loading: '#509AF8',
        success: '#2b641e',
        error: '#EF665B'
    };

    if (type === 'loading') {
        popupClass = 'info-popup';
        messageClass = 'info-message popup-message';
        // 开始下载的SVG（带颜色和类名）
        popupIconSvg = `<svg class="popup-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="color: ${colors.loading};">
            <path d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM303 441L223 361C213.6 351.6 213.6 336.4 223 327.1C232.4 317.8 247.6 317.7 256.9 327.1L295.9 366.1L295.9 216C295.9 202.7 306.6 192 319.9 192C333.2 192 343.9 202.7 343.9 216L343.9 366.1L382.9 327.1C392.3 317.7 407.5 317.7 416.8 327.1C426.1 336.5 426.2 351.7 416.8 361L336.8 441C327.4 450.4 312.2 450.4 302.9 441z"/>
        </svg>`;
    } else if (type === 'success') {
        popupClass = 'success-popup';
        messageClass = 'success-message popup-message';
        // 下载成功的SVG（带颜色和类名）
        popupIconSvg = `<svg class="popup-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="color: ${colors.success};">
            <path d="M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM438 209.7C427.3 201.9 412.3 204.3 404.5 215L285.1 379.2L233 327.1C223.6 317.7 208.4 317.7 199.1 327.1C189.8 336.5 189.7 351.7 199.1 361L271.1 433C276.1 438 282.9 440.5 289.9 440C296.9 439.5 303.3 435.9 307.4 430.2L443.3 243.2C451.1 232.5 448.7 217.5 438 209.7z"/>
        </svg>`;
    } else if (type === 'error') {
        popupClass = 'error-popup';
        messageClass = 'error-message popup-message';
        // 下载失败的SVG（带颜色和类名）
        popupIconSvg = `<svg class="popup-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="color: ${colors.error};">
            <path d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM231 231C240.4 221.6 255.6 221.6 264.9 231L319.9 286L374.9 231C384.3 221.6 399.5 221.6 408.8 231C418.1 240.4 418.2 255.6 408.8 264.9L353.8 319.9L408.8 374.9C418.2 384.3 418.2 399.5 408.8 408.8C399.4 418.1 384.2 418.2 374.9 408.8L319.9 353.8L264.9 408.8C255.5 418.2 240.3 418.2 231 408.8C221.7 399.4 221.6 384.2 231 374.9L286 319.9L231 264.9C221.6 255.5 221.6 240.3 231 231z"/>
        </svg>`;
    }

    popup.className = `popup ${popupClass}`;
    // 替换弹窗HTML，使用新的SVG图标
    popup.innerHTML = `
        <div class="popup-icon">${popupIconSvg}</div>
        <div class="${messageClass}">${message}</div>
    `;

    document.body.appendChild(popup);
    setTimeout(() => {
        popup.style.transform = 'translateX(-50%) scale(1)';
        popup.style.opacity = '1';
    }, 100);
    const autoCloseTime = type === 'loading' ? 2000 : 3000;
    setTimeout(() => {
        if (document.body.contains(popup)) {
            popup.style.transform = 'translateX(-50%) scale(0.9)';
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 400);
        }
    }, autoCloseTime);
    console.log(`[下载${type}] 弹窗已创建，颜色：${colors[type]}`);
}

// 初始化模块
window.addEventListener('DOMContentLoaded', () => {
    injectFaStyles();
    document.addEventListener('contextmenu', showContextMenu, { capture: true });

    document.addEventListener('click', (e) => {
        const menu = document.getElementById('custom-contextmenu');
        if (menu.style.display === 'block' && !menu.contains(e.target)) {
            hideContextMenu();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideContextMenu();
        }
    });
});

document.addEventListener('click', hookClick, { capture: true });