document.addEventListener('DOMContentLoaded', function() {
    // DOM elementlarini olish
    const addShortcutBtn = document.getElementById('addShortcutBtn');
    const addForm = document.getElementById('addForm');
    const editForm = document.getElementById('editForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const saveShortcutBtn = document.getElementById('saveShortcutBtn');
    const updateShortcutBtn = document.getElementById('updateShortcutBtn');
    const shortcutTitle = document.getElementById('shortcutTitle');
    const shortcutUrl = document.getElementById('shortcutUrl');
    const editShortcutTitle = document.getElementById('editShortcutTitle');
    const editShortcutUrl = document.getElementById('editShortcutUrl');
    const editShortcutId = document.getElementById('editShortcutId');
    const shortcutsGrid = document.getElementById('shortcutsGrid');
    
    // Saqlangan shortcutlarni yuklash
    loadShortcuts();
    
    // Ochiq menularni yopish uchun document click event
    document.addEventListener('click', function(event) {
      const dropdowns = document.querySelectorAll('.dropdown-menu.show');
      dropdowns.forEach(function(dropdown) {
        if (!dropdown.contains(event.target) && 
            !event.target.classList.contains('shortcut-menu') && 
            !event.target.classList.contains('shortcut-menu-dots')) {
          dropdown.classList.remove('show');
        }
      });
    });
    
    // "Add Shortcut" tugmasi bosilganda formani ko'rsatish
    addShortcutBtn.addEventListener('click', function() {
      addForm.style.display = 'block';
      editForm.style.display = 'none';
    });
    
    // "Cancel" tugmasi bosilganda formani yashirish
    cancelBtn.addEventListener('click', function() {
      addForm.style.display = 'none';
      shortcutTitle.value = '';
      shortcutUrl.value = '';
    });
    
    // "Cancel Edit" tugmasi bosilganda edit formani yashirish
    cancelEditBtn.addEventListener('click', function() {
      editForm.style.display = 'none';
      editShortcutTitle.value = '';
      editShortcutUrl.value = '';
      editShortcutId.value = '';
    });
    
    // "Save" tugmasi bosilganda shortcut yaratish
    saveShortcutBtn.addEventListener('click', function() {
      const title = shortcutTitle.value.trim();
      let url = shortcutUrl.value.trim();
      
      if (title === '' || url === '') {
        alert('Iltimos, barcha maydonlarni to\'ldiring!');
        return;
      }
      
      // URLga http:// yoki https:// qo'shish, agar mavjud bo'lmasa
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      // Shortcut yaratish
      createShortcut(title, url);
      
      // Formani tozalash va yashirish
      shortcutTitle.value = '';
      shortcutUrl.value = '';
      addForm.style.display = 'none';
    });
    
    // "Update" tugmasi bosilganda shortcutni yangilash
    updateShortcutBtn.addEventListener('click', function() {
      const id = parseInt(editShortcutId.value);
      const title = editShortcutTitle.value.trim();
      let url = editShortcutUrl.value.trim();
      
      if (title === '' || url === '' || isNaN(id)) {
        alert('Iltimos, barcha maydonlarni to\'ldiring!');
        return;
      }
      
      // URLga http:// yoki https:// qo'shish, agar mavjud bo'lmasa
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      // Shortcutni yangilash
      updateShortcut(id, title, url);
      
      // Formani tozalash va yashirish
      editShortcutTitle.value = '';
      editShortcutUrl.value = '';
      editShortcutId.value = '';
      editForm.style.display = 'none';
    });
    
    // Shortcutlarni yuklash funksiyasi
    function loadShortcuts() {
      chrome.storage.sync.get('shortcuts', function(data) {
        const shortcuts = data.shortcuts || [];
        
        // Barcha shortcutlarni ko'rsatish
        shortcutsGrid.innerHTML = '';
        shortcuts.forEach(function(shortcut) {
          addShortcutToGrid(shortcut);
        });
      });
    }
    
    // Yangi shortcut yaratish va saqlash
    function createShortcut(title, url) {
      const shortcut = {
        id: Date.now(), // Unique ID
        title: title,
        url: url
      };
      
      // Mavjud shortcutlarni olish va yangi shortcut qo'shish
      chrome.storage.sync.get('shortcuts', function(data) {
        const shortcuts = data.shortcuts || [];
        shortcuts.push(shortcut);
        
        // Yangilangan ro'yxatni saqlash
        chrome.storage.sync.set({shortcuts: shortcuts}, function() {
          // Yangi shortcutni grid'ga qo'shish
          addShortcutToGrid(shortcut);
        });
      });
    }
    
    // Shortcutni yangilash funksiyasi
    function updateShortcut(id, title, url) {
      chrome.storage.sync.get('shortcuts', function(data) {
        const shortcuts = data.shortcuts || [];
        
        // Shortcutni topish va yangilash
        const updatedShortcuts = shortcuts.map(function(shortcut) {
          if (shortcut.id === id) {
            return {
              id: id,
              title: title,
              url: url
            };
          }
          return shortcut;
        });
        
        // Yangilangan ro'yxatni saqlash
        chrome.storage.sync.set({shortcuts: updatedShortcuts}, function() {
          // Barcha shortcutlarni qayta yuklash
          loadShortcuts();
        });
      });
    }
    
    // Shortcutni o'chirish funksiyasi
    function removeShortcut(id) {
      chrome.storage.sync.get('shortcuts', function(data) {
        const shortcuts = data.shortcuts || [];
        
        // Shortcutni ro'yxatdan o'chirish
        const updatedShortcuts = shortcuts.filter(function(shortcut) {
          return shortcut.id !== id;
        });
        
        // Yangilangan ro'yxatni saqlash
        chrome.storage.sync.set({shortcuts: updatedShortcuts}, function() {
          // Barcha shortcutlarni qayta yuklash
          loadShortcuts();
        });
      });
    }
    
    // Shortcutni tahrirlash uchun formani to'ldirish
    function editShortcut(id) {
      chrome.storage.sync.get('shortcuts', function(data) {
        const shortcuts = data.shortcuts || [];
        
        // Shortcutni topish
        const shortcut = shortcuts.find(function(shortcut) {
          return shortcut.id === id;
        });
        
        if (shortcut) {
          // Edit formani to'ldirish
          editShortcutId.value = shortcut.id;
          editShortcutTitle.value = shortcut.title;
          editShortcutUrl.value = shortcut.url;
          
          // Edit formani ko'rsatish
          addForm.style.display = 'none';
          editForm.style.display = 'block';
        }
      });
    }
    
    // Shortcutni grid'ga qo'shish
    function addShortcutToGrid(shortcut) {
      const shortcutElement = document.createElement('div');
      shortcutElement.className = 'shortcut';
      shortcutElement.dataset.id = shortcut.id;
      
      // Favicon URL ni aniqlash
      const urlObj = new URL(shortcut.url);
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
      
      shortcutElement.innerHTML = `
        <div class="shortcut-icon" data-url="${shortcut.url}">
          <img src="${faviconUrl}" alt="${shortcut.title}" onerror="this.src='images/default-icon.png';">
        </div>
        <div class="shortcut-title">${shortcut.title}</div>
        <div class="shortcut-menu">
          <div class="shortcut-menu-dots">⋮</div>
          <div class="dropdown-menu">
            <div class="dropdown-item edit-shortcut">Edit shortcut</div>
            <div class="dropdown-item remove-shortcut">Remove</div>
          </div>
        </div>
      `;
      
      // Shortcut bosilganda saytni ochish
      const iconElement = shortcutElement.querySelector('.shortcut-icon');
      iconElement.addEventListener('click', function(e) {
        const url = this.getAttribute('data-url');
        chrome.tabs.create({ url: url });
      });
      
      // Menu tugmasi bosilganda dropdown menuni ko'rsatish
      const menuBtn = shortcutElement.querySelector('.shortcut-menu');
      const dropdownMenu = shortcutElement.querySelector('.dropdown-menu');
      
      menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        // Boshqa ochiq menularni yopish
        document.querySelectorAll('.dropdown-menu.show').forEach(function(menu) {
          if (menu !== dropdownMenu) {
            menu.classList.remove('show');
          }
        });
        // Menu ko'rsatish/yashirish
        dropdownMenu.classList.toggle('show');
      });
      
      // Edit tugmasi funksionaligi
      const editBtn = shortcutElement.querySelector('.edit-shortcut');
      editBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const id = parseInt(shortcutElement.dataset.id);
        editShortcut(id);
        dropdownMenu.classList.remove('show');
      });
      
      // O'chirish tugmasi funksionaligi
      const removeBtn = shortcutElement.querySelector('.remove-shortcut');
      removeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const id = parseInt(shortcutElement.dataset.id);
        const confirmDelete = confirm('Ushbu shortcutni o\'chirishni istaysizmi?');
        if (confirmDelete) {
          removeShortcut(id);
        }
        dropdownMenu.classList.remove('show');
      });
      
      shortcutsGrid.appendChild(shortcutElement);
    }
  });