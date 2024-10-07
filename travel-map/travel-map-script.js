const TravelMap = {
    // Constants
    API_KEY: '5b3ce3597851110001cf6248f2cd33880b1940c2853bd933973f70de',
    EARTH_RADIUS: 6371, // km

    // Properties
    map: null,
    pathLayer: null,
    markerLayer: null,
    currentSegment: 0,
    visibleLocationIndices: [],
    animationInProgress: false,
    animationStopped: false,

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

    initMap() {
        this.map = L.map('map', {
            center: [20, 0],
            zoom: 2,
            zoomSnap: 0.1,
            zoomDelta: 0.5,
            wheelDebounceTime: 40,
            wheelPxPerZoomLevel: 80
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
                <div class="popup-location">${location.name}, ${location.state ? location.state + ', ' : ''}${location.country}</div>
                <div class="popup-date">${this.formatDate(location.date)}</div>
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
        this.resetAnimation();
        this.animationInProgress = true;
        this.animationStopped = false;
        for (let i = 0; i < this.travelPath.length - 1; i++) {
            if (this.animationStopped) break;
            await this.animateSegment();
            if (this.animationStopped) break;
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        this.showFullView();
        this.animationInProgress = false;
    },

    stopAnimation() {
        this.animationStopped = true;
    },


    showFullView() {
        const bounds = L.latLngBounds(this.travelPath.map(loc => [loc.lat, loc.lon]));
        this.map.fitBounds(bounds, { padding: [50, 50] });
    },

    showAllRoutes() {
        this.resetAnimation();
        this.travelPath.forEach((location, index) => {
            if (index < this.travelPath.length - 1) {
                const start = location;
                const end = this.travelPath[index + 1];
                const color = this.getColor(end.type);
                const dashArray = end.type === "fly" ? '10, 10' : null;

                if (end.type === 'fly') {
                    const route = this.createArc([start.lat, start.lon], [end.lat, end.lon], 100);
                    L.polyline(route, { color, dashArray }).addTo(this.pathLayer);
                } else {
                    L.polyline([[start.lat, start.lon], [end.lat, end.lon]], { color, dashArray }).addTo(this.pathLayer);
                }
            }
            this.addMarker(location);
        });
        this.showFullView();
    },

    resetAnimation() {
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

};

// Initialize map when the script loads
document.addEventListener('DOMContentLoaded', () => {
    TravelMap.loadTravelData();
});

// Expose necessary functions globally
window.startAnimation = () => {
    if (!TravelMap.animationInProgress) {
        TravelMap.startAnimation();
    }
};
window.stopAnimation = () => TravelMap.stopAnimation();
window.resetAnimation = () => TravelMap.resetAnimation();
window.showAllRoutes = () => TravelMap.showAllRoutes();
