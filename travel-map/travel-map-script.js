
const TravelMap = {
    // API key for OpenRouteService
    API_KEY: '5b3ce3597851110001cf6248f2cd33880b1940c2853bd933973f70de',
    EARTH_RADIUS: 6371, // km used for distance calculation

    // Properties
    map: null,
    pathLayer: null,
    markerLayer: null,
    currentSegment: 0,
    visibleLocationIndices: [],

    // Flag to indicate animation status
    animationInProgress: false,
    animationStopped: false,
    animationPause: false,

    // Nav menu elements
    navMenuBar: null,
    navMenuIcon: null,
    navSideDrawer: null,
    navDrawerHeader: null,
    navDrawerIcon: null,
    navOverlay: null,
    aboutMenuItem: null,
    aboutPage: null,
    aboutClose: null,
    mapOverlay: null,

    // Trip colors
    tripColors: {
        start: '#f0f0f0',
        singaporeStopover: '#ffab40',
        indonesiaAdventure: '#ffd180',
        londonCityBreak: '#ff8a65',
        englishCountrysideTour: '#ffab91',
        bigAppleExperience: '#81d4fa',
        mountainWestAdventure: '#a5d6a7',
        southwestNationalParks: '#c5e1a5',
        southernCharm: '#80deea',
        balkanDiscovery: '#fff59d',
        dolomitesExpedition: '#ffcc80',
        italianCitiesTour: '#ef9a9a',
        indianSojourn: '#ce93d8',
        windyCityVisit: '#90caf9',
        twinCitiesStopover: '#b39ddb',
        newEnglandEscape: '#ADD8E6'
    },

    // Load travel data from JSON file
    async loadTravelData() {
        try {
            console.log('Attempting to fetch travel data...');
            const response = await fetch('./travelData.json');
            console.log('Fetch response:', response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Travel data loaded successfully:', data);
            this.travelPath = data.travelPath.map(location => ({
                ...location,
                lat: location.coordinates.lat,
                lon: location.coordinates.lon
            }));
            this.initMap();
        } catch (error) {
            console.error('Error loading travel data:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
    },

    // Initialize the Leaflet map
    initMap() {
        this.map = L.map('map', {
            center: [20, 0],
            zoom: 2,
            zoomSnap: 0.1,
            zoomDelta: 1.5,
            zoomAnimation: true,
            zoomAnimationThreshold: 4,
            wheelDebounceTime: 40,
            wheelPxPerZoomLevel: 30
        });
    
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    
        this.pathLayer = L.layerGroup().addTo(this.map);
        this.markerLayer = L.layerGroup().addTo(this.map);
        
        if (this.travelPath && this.travelPath.length > 0) {
            this.addMarker(this.travelPath[0], "🏠");
            this.createTimeline();
        }
    
        this.setupSmoothZoom();

        const modal = document.getElementById('summary-modal');
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => this.closeSummaryModal();
        window.onclick = (event) => {
          if (event.target === modal) {
            this.closeSummaryModal();
          }
        };
      },

    setupSmoothZoom() {
        this.map.on('zoomstart', () => this.map.smoothZoom = true);
        this.map.on('zoomend', () => this.map.smoothZoom = false);
    
        this.map._wheelZoom = (e) => {
            if (this.map.smoothZoom) {
                const delta = L.DomEvent.getWheelDelta(e);
                const zoom = this.map.getZoom();
                const newZoom = zoom + delta * 0.1;
                this.map.setZoom(newZoom, { animate: true, duration: 0.25 });
            } else {
                L.Map.prototype._wheelZoom.call(this.map, e);
            }
        };
    },

    // Toggle Navigation Menu with hamburger icon
    toggleNavMenu() {
        this.navSideDrawer.classList.toggle('open');
        this.navOverlay.style.display = this.navSideDrawer.classList.contains('open') ? 'block' : 'none';
        this.navMenuIcon.innerHTML = this.navSideDrawer.classList.contains('open') ? '✕' : '☰';
        this.navDrawerIcon.innerHTML = this.navSideDrawer.classList.contains('open') ? '✕' : '☰';
    },
    
    closeNavMenu() {
        this.navSideDrawer.classList.remove('open');
        this.navOverlay.style.display = 'none';
        this.navMenuIcon.innerHTML = '☰';
        this.navDrawerIcon.innerHTML = '☰';        
    },

    // Initialize navigation menu and related components
    initNavMenu() {
        this.navMenuBar = document.getElementById('nav-menu-bar');
        this.navMenuIcon = document.getElementById('nav-menu-icon');
        this.navSideDrawer = document.getElementById('nav-side-drawer');
        this.navDrawerHeader = document.getElementById('nav-drawer-header');
        this.navDrawerIcon = document.getElementById('nav-drawer-icon');
        this.navOverlay = document.getElementById('nav-overlay');

        this.navMenuBar.addEventListener('click', () => this.toggleNavMenu());
        this.navDrawerHeader.addEventListener('click', () => this.toggleNavMenu());
        this.navOverlay.addEventListener('click', () => this.closeNavMenu());
        this.initAboutPage();

        const summaryMenuItem = document.getElementById('summary-menu-item');
        summaryMenuItem.addEventListener('click', () => {
          this.showSummaryModal();
          this.closeNavMenu();
        });
      },

    initAboutPage() {
        this.aboutMenuItem = document.getElementById('about-menu-item');
        this.aboutPage = document.getElementById('about-page');
        this.aboutClose = document.getElementById('about-close');
        this.mapOverlay = document.getElementById('map-overlay');

        console.log('Init About Page');
        console.log('About menu item:', this.aboutMenuItem);
        console.log('About page:', this.aboutPage);
        console.log('About close:', this.aboutClose);
        console.log('Map overlay:', this.mapOverlay);    
      
        if (this.aboutMenuItem && this.aboutPage && this.aboutClose && this.mapOverlay) {
            this.aboutMenuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('About menu item clicked');
                this.toggleAboutPage();   
            });     
            this.aboutClose.addEventListener('click', () => this.closeAboutPage());
            this.mapOverlay.addEventListener('click', () => this.closeAboutPage());
            console.log('Event listeners added');
        } else {
            console.error('One or more About page elements are missing');
        }
    },
      
    openAboutPage() {
        console.log('Opening About page');
        console.log('About page element before:', this.aboutPage);
        console.log('About page classList before:', this.aboutPage.classList);    
        
        if (this.animationInProgress) {
            this.stopAnimation();
        }
        
        const timeline = document.getElementById('timeline');
        if (timeline) {
            timeline.style.display = 'none';
        }
        
        if (this.aboutPage) {
            this.aboutPage.classList.add('open');
            console.log('About page classList after:', this.aboutPage.classList);
        } else {
            console.error('About page element not found');
        }
        
        if (this.mapOverlay) {
            this.mapOverlay.style.display = 'block';
            console.log('Map overlay display:', this.mapOverlay.style.display);
        } else {
            console.error('Map overlay element not found');
        }
    
        console.log('About page classList after:', this.aboutPage.classList);
    
    },
                
    closeAboutPage() {
        console.log('Closing About page');
        console.log('About page classList before:', this.aboutPage.classList);
    
        this.aboutPage.classList.remove('open');
        this.mapOverlay.style.display = 'none';

        console.log('About page classList after:', this.aboutPage.classList);
        console.log('Map overlay display:', this.mapOverlay.style.display);    
        
        const timeline = document.getElementById('timeline');
        if (timeline) {
          timeline.style.display = 'block';
        }
    },

    toggleAboutPage() {
        if (this.aboutPage.classList.contains('open')) {
            this.closeAboutPage();
        } else {
            this.openAboutPage();
        }
    },    
    
    async fetchRoute(start, end, type) {
        const profile = type === 'train' ? 'driving-car' : 'driving-car';
        const url = `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${this.API_KEY}&start=${start.lon},${start.lat}&end=${end.lon},${end.lat}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        } catch (error) {
            console.error('Error fetching route:', error);
            return [[start.lat, start.lon], [end.lat, end.lon]];
        }
    },

    addMarker(location, icon) {
        if (location.hidden) return;

        const marker = L.marker([location.lat, location.lon])
            .bindPopup(this.createPopupContent(location))
            .addTo(this.markerLayer);

        if (icon) {
            L.marker([location.lat, location.lon], {
                icon: L.divIcon({
                    html: icon,
                    className: 'travel-icon',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(this.markerLayer);
        }
    },

    createPopupContent(location) {
        return `
            <div class="popup-content">
                <div class="popup-location">${location.name}</div>
            </div>
        `;
    },

    async animateSegment() {
        if (this.currentSegment >= this.travelPath.length - 1) return;
    
        const start = this.travelPath[this.currentSegment];
        const end = this.travelPath[this.currentSegment + 1];
    
        this.highlightNextDestination(end);
    
        const route = await this.getRoute(start, end);
    
        const line = this.createPolyline(end, route);
    
        const icon_marker = this.createIconMarker(end, start);
    
        const bounds = L.latLngBounds(route);
        this.map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 12, duration: 1 });
    
        await this.animatePath(route, line, icon_marker, end);
    },

    highlightNextDestination(end) {
        if (!end.hidden) {
            const nextVisibleIndex = this.visibleLocationIndices.indexOf(this.currentSegment + 1);
            if (nextVisibleIndex !== -1) {
                this.highlightTimelineItem(nextVisibleIndex);
            }
        }
    },

    async getRoute(start, end) {
        if (end.type === 'fly') {
            return this.createArc([start.lat, start.lon], [end.lat, end.lon], 100);
        } else if (end.type === 'drive' || end.type === 'train') {
            return await this.fetchRoute(start, end, end.type);
        } else {
            return [[start.lat, start.lon], [end.lat, end.lon]];
        }
    },

    createPolyline(end, route) {
        const color = this.getColor(end.type);
        const dashArray = end.type === "fly" ? '10, 10' : null;
    
        return L.polyline([], {
            color: color,
            dashArray: dashArray
        }).addTo(this.pathLayer);
    },

    createIconMarker(end, start) {
        if (end.hidden) return null;

        const icon = this.getIcon(end.type);
        return L.marker([start.lat, start.lon], {
            icon: L.divIcon({
                html: `<div style="font-size: 30px; display: flex; justify-content: center; align-items: center; width: 100%; height: 100%;">${icon}</div>`,
                className: 'travel-icon',
                iconSize: [60, 60],
                iconAnchor: [30, 30]
            })
        }).addTo(this.markerLayer);
    },

    animatePath(route, line, icon_marker, end) {
        const animationDuration = 3000;
        const startTime = Date.now();
    
        return new Promise((resolve) => {
            const animate = () => {
                const elapsedTime = Date.now() - startTime;
                const progress = Math.min(elapsedTime / animationDuration, 1);
    
                const currentIndex = Math.floor(progress * (route.length - 1));
                const currentPoint = route[currentIndex];
    
                if (icon_marker) {
                    icon_marker.setLatLng(currentPoint);
                }
                
                line.setLatLngs(route.slice(0, currentIndex + 1));
    
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    if (!end.hidden) {
                        this.addMarker(end);
                    }
                    this.currentSegment++;
                    resolve();
                }
            };
    
            setTimeout(animate, 1000);
        });
    },

    createArc(start, end, numPoints = 100) {
        const latlngs = [];
        const R = this.EARTH_RADIUS;

        // Convert lat/lon to radians
        const lat1 = this.toRadians(start[0]);
        const lon1 = this.toRadians(start[1]);
        const lat2 = this.toRadians(end[0]);
        const lon2 = this.toRadians(end[1]);

        // Calculate the great circle distance
        const d = 2 * R * Math.asin(Math.sqrt(
            Math.sin((lat2 - lat1) / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2
        ));

        for (let i = 0; i <= numPoints; i++) {
            const f = i / numPoints;
            
            // Exaggerate the curvature
            const exaggeration = 0.15; // Adjust this value to increase/decrease curvature
            const altitude = Math.sin(Math.PI * f) * exaggeration * d / 2;

            const A = Math.sin((1 - f) * d / R) / Math.sin(d / R);
            const B = Math.sin(f * d / R) / Math.sin(d / R);

            const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
            const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
            const z = A * Math.sin(lat1) + B * Math.sin(lat2);

            const lat = Math.atan2(z, Math.sqrt(x ** 2 + y ** 2));
            const lon = Math.atan2(y, x);

            latlngs.push([
                this.toDegrees(lat) + (altitude / R) * (180 / Math.PI),
                this.toDegrees(lon)
            ]);
        }

        return latlngs;
    },

    toRadians(degrees) {
        return degrees * Math.PI / 180;
    },

    toDegrees(radians) {
        return radians * 180 / Math.PI;
    },

    async startAnimation() {
        if (this.animationInProgress && this.animationPaused) {
            // Resume animation
            this.animationPaused = false;
            document.getElementById('playPauseBtn').textContent = 'Pause';
            return;
        }

        this.resetAnimation();
        this.animationInProgress = true;
        this.animationStopped = false;
        this.animationPaused = false;
        document.getElementById('playPauseBtn').textContent = 'Pause';

        for (let i = 0; i < this.travelPath.length - 1; i++) {
            if (this.animationStopped) break;
            while (this.animationPaused) {
                await new Promise(resolve => setTimeout(resolve, 100));
                if (this.animationStopped) break;
            }
            if (this.animationStopped) break;
            await this.animateSegment();
            if (this.animationStopped) break;
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        this.showFullView();
        this.animationInProgress = false;
        this.showSummaryModal();
        document.getElementById('playPauseBtn').textContent = 'Play';
    },

    stopAnimation() {
        this.animationStopped = true;
        this.animationPaused = false;
        this.animationInProgress = false;
        document.getElementById('playPauseBtn').textContent = 'Play';
    },

    togglePlayPause() {
        if (!this.animationInProgress) {
            this.startAnimation();
        } else if (this.animationPaused) {
            this.animationPaused = false;
            document.getElementById('playPauseBtn').textContent = 'Pause';
        } else {
            this.animationPaused = true;
            document.getElementById('playPauseBtn').textContent = 'Play';
        }
    },


    showFullView() {
        const bounds = L.latLngBounds(this.travelPath.map(loc => [loc.lat, loc.lon]));
        this.map.fitBounds(bounds, { padding: [50, 50] });
    },

    async showAllRoutes() {
        this.resetAnimation();
        for (let i = 0; i < this.travelPath.length - 1; i++) {
          const start = this.travelPath[i];
          const end = this.travelPath[i + 1];
          const color = this.getColor(end.type);
          const dashArray = end.type === "fly" ? '10, 10' : null;
      
          let route;
          if (end.type === 'drive' || end.type === 'train') {
            route = await this.fetchRoute(start, end, end.type);
          } else if (end.type === 'fly') {
            route = this.createArc([start.lat, start.lon], [end.lat, end.lon], 100);
          } else {
            route = [[start.lat, start.lon], [end.lat, end.lon]];
          }
      
          L.polyline(route, { color, dashArray }).addTo(this.pathLayer);
          this.addMarker(start);
        }
        this.addMarker(this.travelPath[this.travelPath.length - 1]);
        this.showFullView();

          // Trigger the summary modal after showing all routes
        setTimeout(() => {
            this.showSummaryModal();
        }, 1000);  // Delay of 1 second to allow the map to settle
        },

        resetAnimation() {
            this.stopAnimation();
            this.currentSegment = 0;
            this.pathLayer.clearLayers();
            this.markerLayer.clearLayers();
            this.addMarker(this.travelPath[0], "🏠");
            this.map.setView([20, 0], 2);
            this.clearTimelineHighlights();
        },

    createTimeline() {
        const timeline = document.getElementById('timeline');
        timeline.innerHTML = '';
        this.visibleLocationIndices = [];
        let previousVisibleLocation = null;
      
        this.travelPath.forEach((location, index) => {
            if (!location.hidden) {
                const item = document.createElement('div');
                item.className = 'timeline-item';
                
                const expandIcon = document.createElement('span');
                expandIcon.className = 'expand-icon';
                expandIcon.textContent = '+';
                item.appendChild(expandIcon);
                
                const bgColor = this.tripColors[location.tripGroup] || '#ffffff';
                item.style.backgroundColor = this.hexToRGBA(bgColor, 0.3);
                
                let distance = '';
                if (previousVisibleLocation) {
                    distance = this.calculateDistance(previousVisibleLocation, location);
                }
                
                const truncatedDescription = this.truncateText(location.description, 150);
                
                item.innerHTML += `
                    <div class="timeline-location">
                        <span class="timeline-icon">${this.getTimelineIcon(location)}</span>${location.name}, ${location.country}
                    </div>
                    <div class="timeline-date">${this.formatDate(location.date)}</div>
                    <div class="timeline-description">${truncatedDescription}</div>
                    ${distance ? `<div class="timeline-distance">${distance} km</div>` : ''}
                `;
                item.onclick = (e) => {
                    if (e.target.classList.contains('read-more')) {
                        e.preventDefault();
                    }
                    this.jumpToLocation(index);
                    this.toggleDrawer(location);
                };
                timeline.appendChild(item);
          
                this.visibleLocationIndices.push(index);
                previousVisibleLocation = location;
            }
        });
    },

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        const truncated = text.substr(0, maxLength);
        return truncated.substr(0, truncated.lastIndexOf(' ')) + '... <a href="#" class="read-more">Read more</a>';
    },

    jumpToLocation(index) {
        const location = this.travelPath[index];
        this.map.flyTo([location.lat, location.lon], 8, {
            animate: true,
            duration: 2
        });
        
        setTimeout(() => {
            L.popup()
                .setLatLng([location.lat, location.lon])
                .setContent(this.createPopupContent(location))
                .openOn(this.map);
        }, 2000);
        
        const visibleIndex = this.visibleLocationIndices.indexOf(index);
        if (visibleIndex !== -1) {
            this.highlightTimelineItem(visibleIndex);
        }
    },
        
    highlightTimelineItem(visibleIndex) {
        this.clearTimelineHighlights();
        const timeline = document.getElementById('timeline');
        const timelineItems = timeline.querySelectorAll('.timeline-item');
        const activeItem = timelineItems[visibleIndex];
        if (activeItem) {
            activeItem.classList.add('active');
            
            // Center the active item in the timeline
            const itemHeight = activeItem.offsetHeight;
            const timelineHeight = timeline.offsetHeight;
            const scrollTop = activeItem.offsetTop - (timelineHeight / 2) + (itemHeight / 2);
            
            timeline.scrollTo({
                top: scrollTop,
                behavior: 'smooth'
            });
        }
    },

    clearTimelineHighlights() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.originalColor) {
                item.style.backgroundColor = item.dataset.originalColor;
                delete item.dataset.originalColor;
            }
        });
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    },

    getTimelineIcon(location) {
        // This function returns an icon based on the location type or activity
        switch(location.type) {
            case "city": return "🏙️";
            case "nature": return "🏞️";
            case "beach": return "🏖️";
            case "mountain": return "🏔️";
            case "landmark": return "🏛️";
            case "activity": return "🎭";
            case "food": return "🍴";
            default: return "📍";
        }
    },

    getIcon(type) {
        switch(type) {
            case "fly": return "✈️";
            case "drive": return "🚗";
            case "train": return "🚂";
            case "hike": return "🥾";
            default: return "📍";
        }
    },

    getColor(type) {
        switch(type) {
            case "fly": return 'blue';
            case "drive": return 'red';
            case "train": return 'green';
            case "hike": return 'orange';
            default: return 'purple';
        }
    },

    hexToRGBA(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

        // Update the calculateDistance method to use EARTH_RADIUS
    calculateDistance(location1, location2) {
    const dLat = this.toRadians(location2.lat - location1.lat);
    const dLon = this.toRadians(location2.lon - location1.lon);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.toRadians(location1.lat)) * Math.cos(this.toRadians(location2.lat)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = this.EARTH_RADIUS * c;
    return Math.round(distance);
    },

    toggleDrawer(location) {
        const drawer = document.getElementById('drawer');
        const isOpen = drawer.classList.toggle('open');
        
        if (isOpen && location) {
            document.getElementById('drawer-title').textContent = location.name;
            if (location.state) {
            document.getElementById('drawer-title').textContent += ', ' + location.state;
            }
            if (location.country) {
            document.getElementById('drawer-title').textContent += ', ' + location.country;
            }
            document.getElementById('drawer-description').innerHTML = `
            <div class="timeline-date">${this.formatDate(location.date)}</div>
            <div class="timeline-description">${location.description || ''}</div>
          `;
          this.populateImageGallery(location.images);
          this.updateExpandIcons(location.name);
        }
      },
      
    updateExpandIcons(openLocationName) {
        const items = document.querySelectorAll('.timeline-item');
        items.forEach(item => {
          const icon = item.querySelector('.expand-icon');
          if (item.querySelector('.timeline-location').textContent.trim() === openLocationName) {
            icon.textContent = '−';
          } else {
            icon.textContent = '+';
          }
        });
      },
      
      populateImageGallery(images) {
        const gallery = document.querySelector('.image-gallery');
        gallery.innerHTML = '';
        if (images && images.length > 0) {
          images.forEach(img => {
            const imgElement = document.createElement('img');
            imgElement.src = img.url;
            imgElement.alt = img.alt;
            imgElement.onclick = () => this.showFullsizeImage(img.url);
            gallery.appendChild(imgElement);
          });
        }
      },
      
      showFullsizeImage(src) {
        const fullsizeImage = document.getElementById('fullsize-image');
        fullsizeImage.querySelector('img').src = src;
        fullsizeImage.style.display = 'flex';
      },
      
      closeFullsizeImage() {
        document.getElementById('fullsize-image').style.display = 'none';
      },

      //This is for the summary pop-up page
      showSummaryModal() {
        this.closeNavMenu();
        this.closeAboutPage();      
        const modal = document.getElementById('summary-modal');
        modal.style.display = 'block';
        this.populateSummaryContent();
      },
      
      closeSummaryModal() {
        const modal = document.getElementById('summary-modal');
        modal.style.display = 'none';
      },

      populateSummaryContent() {
        const summaryContent = document.getElementById('summary-content');
        const distanceByTransport = this.calculateDistanceByTransport();
        const totalDistance = Object.values(distanceByTransport).reduce((a, b) => a + b, 0);
      
        let distanceBreakdown = '';
        for (let type in distanceByTransport) {
          if (distanceByTransport[type] > 0) {
            distanceBreakdown += `<li>${type.charAt(0).toUpperCase() + type.slice(1)}: ${distanceByTransport[type]} km</li>`;
          }
        }
      
        summaryContent.innerHTML = `
          <p><strong>Distance breakdown</strong></p>
          <ul>
            ${distanceBreakdown}
          </ul>
          <p><strong>Total = </strong> 60944 km</p>
          <p><strong>Number of cities visited:</strong> 46</p>
          <p><strong>Coldest day:</strong><br> 5°C in Tre Cime National Park, Dolomites on Sep 20</p>
          <p><strong>Hottest temperature:</strong><br> 42°C in Zion National Park, Utah on Jul 31</p>
          <p><strong>Highest point:</strong><br> 2528m at Rifugio Pian di Cengia, Dolomites on Sep 21</p>
          <p><strong>Lowest point:</strong><br> -30m below sea level at Liberty Wreck, Tulamben, Bali on Apr 14</p>
        `;
      },
      
      //These are to calculate some fun stats to display
      calculateDistanceByTransport() {
        const distanceByType = {
          fly: 0,
          drive: 0,
          train: 0,
        };
      
        for (let i = 0; i < this.travelPath.length - 1; i++) {
          const start = this.travelPath[i];
          const end = this.travelPath[i + 1];
          const distance = this.calculateDistance(start, end);
      
          // Use the type of the destination (end) as the travel type
          const travelType = end.type || 'other';
      
          if (distanceByType.hasOwnProperty(travelType)) {
            distanceByType[travelType] += distance;
          } else {
            distanceByType.other += distance;
          }
        }
      
        // Round all distances
        for (let type in distanceByType) {
          distanceByType[type] = Math.round(distanceByType[type]);
        }
      
        return distanceByType;
      },

};

// Initialize map when the script loads
document.addEventListener('DOMContentLoaded', () => {
    TravelMap.loadTravelData();
    TravelMap.initNavMenu();

    const playPauseBtn = document.getElementById('playPauseBtn');
    const resetBtn = document.getElementById('resetBtn');

    playPauseBtn.addEventListener('click', () => TravelMap.togglePlayPause());
    resetBtn.addEventListener('click', () => TravelMap.resetAnimation());

});

document.addEventListener('click', (e) => {
    console.log('Clicked element:', e.target);
});

// Mobile banner
document.addEventListener('DOMContentLoaded', function() {
    const banner = document.getElementById('mobile-banner');
    const closeBanner = document.getElementById('close-banner');
  
    function checkScreenSize() {
      if (window.innerWidth <= 768) {
        banner.style.display = 'block';
      } else {
        banner.style.display = 'none';
      }
    }
  
    closeBanner.addEventListener('click', function() {
      banner.style.display = 'none';
    });
  
    window.addEventListener('resize', checkScreenSize);
    checkScreenSize(); // Check on initial load
  });  

// Expose necessary functions globally
window.startAnimation = () => {
    if (!TravelMap.animationInProgress) {
        TravelMap.startAnimation();
    }
};
window.stopAnimation = () => TravelMap.stopAnimation();
window.resetAnimation = () => TravelMap.resetAnimation();
window.showAllRoutes = () => {
    TravelMap.showAllRoutes().catch(error => console.error('Error showing all routes:', error));
  };

  