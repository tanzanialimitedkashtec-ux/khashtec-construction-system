// ===== UI CONTROLLER =====
class UIController {
    static showContent(content) {
        const contentArea = document.getElementById('contentArea');
        if (contentArea) {
            contentArea.innerHTML = content;
        }
    }

    static showUserInfo(text) {
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.textContent = text;
        }
    }
}

// Export for global use
window.UIController = UIController;
