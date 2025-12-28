// Affordable Food Radar - Main Application
class FoodRadarApp {
    constructor() {
        this.map = null;
        this.userLocation = null;
        this.vendors = [];
        this.filteredVendors = [];
        this.favorites = JSON.parse(localStorage.getItem('foodRadar_favorites') || '[]');
        this.searchHistory = JSON.parse(localStorage.getItem('foodRadar_searchHistory') || '[]');
        this.currentView = 'map';
        this.filters = {
            priceMin: 50,
            priceMax: 200,
            openNow: true,
            lateNight: false,
            festivalHours: false,
            studentDiscount: false,
            hiddenDeals: false,
            quickFilters: []
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadSampleData();
        this.requestLocationPermission();
        this.checkFestivalStatus();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        // Search functionality
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        // Voice search
        document.getElementById('voice-btn').addEventListener('click', () => {
            this.startVoiceSearch();
        });
        
        // Quick filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleQuickFilter(e.target.dataset.filter);
            });
        });
        
        // View toggle
        document.getElementById('map-view-btn').addEventListener('click', () => {
            this.switchView('map');
        });
        
        document.getElementById('list-view-btn').addEventListener('click', () => {
            this.switchView('list');
        });
        
        // Filter toggle
        document.getElementById('filter-toggle-btn').addEventListener('click', () => {
            this.toggleAdvancedFilters();
        });
        
        // Price sliders
        document.getElementById('price-min').addEventListener('input', (e) => {
            this.filters.priceMin = parseInt(e.target.value);
            document.getElementById('price-min-display').textContent = `₹${e.target.value}`;
            this.applyFilters();
        });
        
        document.getElementById('price-max').addEventListener('input', (e) => {
            this.filters.priceMax = parseInt(e.target.value);
            document.getElementById('price-max-display').textContent = `₹${e.target.value}`;
            this.applyFilters();
        });
        
        // Filter checkboxes
        document.getElementById('open-now').addEventListener('change', (e) => {
            this.filters.openNow = e.target.checked;
            this.applyFilters();
        });
        
        document.getElementById('late-night').addEventListener('change', (e) => {
            this.filters.lateNight = e.target.checked;
            this.applyFilters();
        });
        
        document.getElementById('student-discount').addEventListener('change', (e) => {
            this.filters.studentDiscount = e.target.checked;
            this.applyFilters();
        });
        
        // Bottom navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });
        
        // Location button
        document.getElementById('location-btn').addEventListener('click', () => {
            this.getCurrentLocation();
        });
        
        // Modal close buttons
        document.querySelectorAll('.close-modal-btn, .close-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal();
            });
        });
    }
    
    loadSampleData() {
        this.vendors = [
            {
                id: 1,
                name: "Ravi's Dosa Corner",
                priceRange: { min: 40, max: 80 },
                location: { lat: 28.6139, lng: 77.2090 },
                area: "Connaught Place",
                tags: ['budget', 'student'],
                quirk: "Extra chutney free, owner tells jokes",
                openHours: { start: 7, end: 23 },
                discounts: { student: 10 },
                rating: 4.2,
                distance: 0.5,
                festivalSpecial: "Festival thali ₹60"
            },
            {
                id: 2,
                name: "Midnight Momos",
                priceRange: { min: 60, max: 120 },
                location: { lat: 28.6304, lng: 77.2177 },
                area: "Karol Bagh",
                tags: ['late-night', 'budget'],
                quirk: "Open till 3 AM, spicy challenge available",
                openHours: { start: 18, end: 3 },
                discounts: {},
                rating: 4.5,
                distance: 1.2,
                festivalSpecial: null
            },
            {
                id: 3,
                name: "Student Canteen",
                priceRange: { min: 30, max: 70 },
                location: { lat: 28.6562, lng: 77.2410 },
                area: "Delhi University",
                tags: ['student', 'budget'],
                quirk: "Unlimited refills on dal rice",
                openHours: { start: 8, end: 20 },
                discounts: { student: 20 },
                rating: 4.0,
                distance: 2.1,
                festivalSpecial: "Special sweets counter"
            },
            {
                id: 4,
                name: "Festival Food Court",
                priceRange: { min: 80, max: 150 },
                location: { lat: 28.6289, lng: 77.2065 },
                area: "India Gate",
                tags: ['festival', 'special'],
                quirk: "Live cooking shows, cultural performances",
                openHours: { start: 10, end: 22 },
                discounts: { festival: 15 },
                rating: 4.7,
                distance: 0.8,
                festivalSpecial: "Traditional festival menu available"
            },
            {
                id: 5,
                name: "Chai Sutta Bar",
                priceRange: { min: 20, max: 60 },
                location: { lat: 28.6517, lng: 77.2219 },
                area: "Chandni Chowk",
                tags: ['budget', 'late-night'],
                quirk: "Best chai in old Delhi, poetry sessions",
                openHours: { start: 6, end: 24 },
                discounts: { hidden: "Buy 2 get 1 free after 10 PM" },
                rating: 4.3,
                distance: 1.5,
                festivalSpecial: null
            }
        ];
        
        this.applyFilters();
    }
    
    handleSearch(query) {
        if (!query.trim()) {
            this.filteredVendors = this.vendors;
        } else {
            this.filteredVendors = this.vendors.filter(vendor => 
                vendor.name.toLowerCase().includes(query.toLowerCase()) ||
                vendor.area.toLowerCase().includes(query.toLowerCase()) ||
                vendor.quirk.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        // Add to search history
        if (query.trim() && !this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            this.searchHistory = this.searchHistory.slice(0, 10); // Keep only last 10
            localStorage.setItem('foodRadar_searchHistory', JSON.stringify(this.searchHistory));
        }
        
        this.updateDisplay();
    }
    
    toggleQuickFilter(filterType) {
        const btn = document.querySelector(`[data-filter="${filterType}"]`);
        
        if (this.filters.quickFilters.includes(filterType)) {
            this.filters.quickFilters = this.filters.quickFilters.filter(f => f !== filterType);
            btn.classList.remove('active');
        } else {
            this.filters.quickFilters.push(filterType);
            btn.classList.add('active');
        }
        
        this.applyFilters();
    }
    
    applyFilters() {
        this.filteredVendors = this.vendors.filter(vendor => {
            // Price range filter
            if (vendor.priceRange.min > this.filters.priceMax || vendor.priceRange.max < this.filters.priceMin) {
                return false;
            }
            
            // Quick filters
            if (this.filters.quickFilters.length > 0) {
                const hasMatchingTag = this.filters.quickFilters.some(filter => {
                    switch(filter) {
                        case 'budget': return vendor.priceRange.max <= 100;
                        case 'student': return vendor.tags.includes('student');
                        case 'late-night': return vendor.tags.includes('late-night');
                        case 'festival': return vendor.tags.includes('festival') || vendor.festivalSpecial;
                        default: return false;
                    }
                });
                if (!hasMatchingTag) return false;
            }
            
            // Open hours filter
            if (this.filters.openNow) {
                const currentHour = new Date().getHours();
                const isOpen = vendor.openHours.start <= currentHour && currentHour <= vendor.openHours.end;
                if (!isOpen) return false;
            }
            
            return true;
        });
        
        this.updateDisplay();
    }
    
    switchView(view) {
        this.currentView = view;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${view}-view-btn`).classList.add('active');
        
        // Show/hide containers
        if (view === 'map') {
            document.getElementById('map-container').classList.remove('hidden');
            document.getElementById('list-container').classList.add('hidden');
            this.initMap();
        } else {
            document.getElementById('map-container').classList.add('hidden');
            document.getElementById('list-container').classList.remove('hidden');
        }
        
        this.updateDisplay();
    }
    
    switchTab(tab) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
        
        if (tab === 'home') {
            // Show main content
            document.querySelector('.main-content').style.display = 'block';
        } else {
            // Hide main content and show tab
            document.querySelector('.main-content').style.display = 'none';
            document.getElementById(`${tab}-tab`).classList.remove('hidden');
            
            if (tab === 'deals') {
                this.loadDeals();
            } else if (tab === 'profile') {
                this.loadProfile();
            }
        }
    }
    
    toggleAdvancedFilters() {
        const filters = document.getElementById('advanced-filters');
        filters.classList.toggle('hidden');
    }
    
    updateDisplay() {
        if (this.currentView === 'list') {
            this.updateListView();
        } else {
            this.updateMapView();
        }
        
        // Update results count
        const count = this.filteredVendors.length;
        if (count === 0) {
            document.getElementById('no-results').classList.remove('hidden');
        } else {
            document.getElementById('no-results').classList.add('hidden');
        }
    }
    
    updateListView() {
        const container = document.getElementById('vendor-list');
        container.innerHTML = '';
        
        this.filteredVendors.forEach(vendor => {
            const card = this.createVendorCard(vendor);
            container.appendChild(card);
        });
    }
    
    createVendorCard(vendor) {
        const card = document.createElement('div');
        card.className = 'vendor-card';
        card.onclick = () => this.showVendorDetails(vendor);
        
        const tags = vendor.tags.map(tag => {
            const icons = {
                'student': '🎓',
                'late-night': '🌙',
                'festival': '🪔',
                'budget': '💰'
            };
            return `<span class="tag tag-${tag}">${icons[tag] || ''} ${tag}</span>`;
        }).join('');
        
        const festivalBadge = vendor.festivalSpecial ? 
            `<div class="festival-badge">🪔 ${vendor.festivalSpecial}</div>` : '';
        
        card.innerHTML = `
            <div class="vendor-header">
                <h3 class="vendor-name">${vendor.name}</h3>
                <div class="vendor-rating">
                    ${'⭐'.repeat(Math.floor(vendor.rating))} ${vendor.rating}
                </div>
            </div>
            <div class="vendor-info">
                <div class="price-range">₹${vendor.priceRange.min} - ₹${vendor.priceRange.max}</div>
                <div class="distance">${vendor.distance} km away</div>
            </div>
            <div class="vendor-tags">${tags}</div>
            <div class="vendor-quirk">${vendor.quirk}</div>
            ${festivalBadge}
            <div class="vendor-actions">
                <button class="action-btn navigate-btn" onclick="event.stopPropagation(); app.navigate(${vendor.id})">Navigate</button>
                <button class="action-btn save-btn" onclick="event.stopPropagation(); app.toggleFavorite(${vendor.id})">
                    ${this.favorites.includes(vendor.id) ? 'Saved' : 'Save'}
                </button>
                <button class="action-btn share-btn" onclick="event.stopPropagation(); app.shareVendor(${vendor.id})">Share</button>
            </div>
        `;
        
        return card;
    }
    
    showVendorDetails(vendor) {
        const modal = document.getElementById('vendor-modal');
        document.getElementById('modal-vendor-name').textContent = vendor.name;
        
        const details = `
            <div class="modal-vendor-info">
                <div class="info-row">
                    <span class="info-label">Price Range:</span>
                    <span class="info-value">₹${vendor.priceRange.min} - ₹${vendor.priceRange.max}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Location:</span>
                    <span class="info-value">${vendor.area}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Distance:</span>
                    <span class="info-value">${vendor.distance} km away</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Hours:</span>
                    <span class="info-value">${vendor.openHours.start}:00 - ${vendor.openHours.end}:00</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Special:</span>
                    <span class="info-value">${vendor.quirk}</span>
                </div>
                ${vendor.festivalSpecial ? `
                <div class="info-row festival-special">
                    <span class="info-label">🪔 Festival Special:</span>
                    <span class="info-value">${vendor.festivalSpecial}</span>
                </div>
                ` : ''}
            </div>
        `;
        
        document.getElementById('modal-vendor-details').innerHTML = details;
        
        // Update action buttons
        document.getElementById('modal-navigate-btn').onclick = () => this.navigate(vendor.id);
        document.getElementById('modal-save-btn').onclick = () => this.toggleFavorite(vendor.id);
        document.getElementById('modal-share-btn').onclick = () => this.shareVendor(vendor.id);
        
        modal.classList.remove('hidden');
    }
    
    closeModal() {
        document.querySelectorAll('.modal, .tab-content').forEach(el => {
            el.classList.add('hidden');
        });
        document.querySelector('.main-content').style.display = 'block';
    }
    
    navigate(vendorId) {
        const vendor = this.vendors.find(v => v.id === vendorId);
        if (vendor) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${vendor.location.lat},${vendor.location.lng}`;
            window.open(url, '_blank');
            this.showToast(`Opening navigation to ${vendor.name}`);
        }
    }
    
    toggleFavorite(vendorId) {
        if (this.favorites.includes(vendorId)) {
            this.favorites = this.favorites.filter(id => id !== vendorId);
            this.showToast('Removed from favorites');
        } else {
            this.favorites.push(vendorId);
            this.showToast('Added to favorites');
        }
        
        localStorage.setItem('foodRadar_favorites', JSON.stringify(this.favorites));
        this.updateDisplay(); // Refresh to update button states
    }
    
    shareVendor(vendorId) {
        const vendor = this.vendors.find(v => v.id === vendorId);
        if (vendor) {
            if (navigator.share) {
                navigator.share({
                    title: `Check out ${vendor.name}`,
                    text: `${vendor.quirk} - ₹${vendor.priceRange.min}-${vendor.priceRange.max}`,
                    url: window.location.href
                });
            } else {
                // Fallback for browsers without Web Share API
                const text = `Check out ${vendor.name}: ${vendor.quirk} - ₹${vendor.priceRange.min}-${vendor.priceRange.max}`;
                navigator.clipboard.writeText(text);
                this.showToast('Vendor info copied to clipboard');
            }
        }
    }
    
    loadDeals() {
        const dealsList = document.getElementById('deals-list');
        const currentDeals = this.vendors.filter(v => 
            v.discounts.student || v.discounts.hidden || v.festivalSpecial
        );
        
        dealsList.innerHTML = currentDeals.map(vendor => `
            <div class="deal-card" onclick="app.showVendorDetails(${JSON.stringify(vendor).replace(/"/g, '&quot;')})">
                <h4>${vendor.name}</h4>
                <div class="deal-info">
                    ${vendor.discounts.student ? `🎓 ${vendor.discounts.student}% student discount` : ''}
                    ${vendor.discounts.hidden ? `🎯 ${vendor.discounts.hidden}` : ''}
                    ${vendor.festivalSpecial ? `🪔 ${vendor.festivalSpecial}` : ''}
                </div>
                <div class="deal-location">${vendor.area} • ${vendor.distance} km away</div>
            </div>
        `).join('');
    }
    
    loadProfile() {
        // Load favorites
        const favoritesList = document.getElementById('favorites-list');
        const favoriteVendors = this.vendors.filter(v => this.favorites.includes(v.id));
        
        if (favoriteVendors.length === 0) {
            favoritesList.innerHTML = '<p class="empty-state">No favorites yet. Start exploring!</p>';
        } else {
            favoritesList.innerHTML = favoriteVendors.map(vendor => `
                <div class="favorite-item" onclick="app.showVendorDetails(${JSON.stringify(vendor).replace(/"/g, '&quot;')})">
                    <span class="favorite-name">${vendor.name}</span>
                    <span class="favorite-area">${vendor.area}</span>
                </div>
            `).join('');
        }
        
        // Load search history
        const searchHistory = document.getElementById('search-history');
        if (this.searchHistory.length === 0) {
            searchHistory.innerHTML = '<p class="empty-state">No recent searches</p>';
        } else {
            searchHistory.innerHTML = this.searchHistory.map(search => `
                <div class="history-item" onclick="document.getElementById('search-input').value='${search}'; app.handleSearch('${search}'); app.switchTab('home')">
                    ${search}
                </div>
            `).join('');
        }
    }
    
    requestLocationPermission() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    this.updateDistances();
                },
                (error) => {
                    console.log('Location access denied');
                    // Use default location (Delhi)
                    this.userLocation = { lat: 28.6139, lng: 77.2090 };
                }
            );
        }
    }
    
    getCurrentLocation() {
        if (navigator.geolocation) {
            this.showToast('Getting your location...');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    this.updateDistances();
                    this.showToast('Location updated');
                },
                (error) => {
                    this.showToast('Could not get location');
                }
            );
        }
    }
    
    updateDistances() {
        if (!this.userLocation) return;
        
        this.vendors.forEach(vendor => {
            vendor.distance = this.calculateDistance(
                this.userLocation.lat, this.userLocation.lng,
                vendor.location.lat, vendor.location.lng
            );
        });
        
        // Sort by distance
        this.vendors.sort((a, b) => a.distance - b.distance);
        this.applyFilters();
    }
    
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return Math.round(R * c * 10) / 10; // Round to 1 decimal
    }
    
    startVoiceSearch() {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-IN';
            
            recognition.onstart = () => {
                this.showToast('Listening...');
                document.getElementById('voice-btn').style.background = '#ef4444';
            };
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('search-input').value = transcript;
                this.handleSearch(transcript);
            };
            
            recognition.onend = () => {
                document.getElementById('voice-btn').style.background = '';
            };
            
            recognition.start();
        } else {
            this.showToast('Voice search not supported');
        }
    }
    
    checkFestivalStatus() {
        // Simple festival detection (can be enhanced with actual calendar)
        const today = new Date();
        const festivals = [
            { name: 'Diwali', month: 10, day: 24 },
            { name: 'Holi', month: 2, day: 13 },
            { name: 'Dussehra', month: 9, day: 15 }
        ];
        
        const currentFestival = festivals.find(f => 
            f.month === today.getMonth() && 
            Math.abs(f.day - today.getDate()) <= 3
        );
        
        if (currentFestival) {
            this.showToast(`🪔 ${currentFestival.name} specials available!`);
        }
    }
    
    initMap() {
        // Placeholder for Google Maps integration
        // In a real app, you would initialize Google Maps here
        console.log('Map would be initialized here');
    }
    
    updateMapView() {
        // Placeholder for map updates
        console.log('Map would be updated with filtered vendors');
    }
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        const container = document.getElementById('toast-container');
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                container.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FoodRadarApp();
});

// Global functions for inline event handlers
window.app = app;