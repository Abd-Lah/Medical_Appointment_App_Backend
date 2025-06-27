/**
 * City Selector Utility
 * Provides a searchable dropdown for Morocco cities
 */

class CitySelector {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.options = {
            placeholder: 'Search for a city...',
            noResultsText: 'No cities found',
            minSearchLength: 1,
            maxResults: 10,
            ...options
        };
        
        this.cities = [];
        this.filteredCities = [];
        this.selectedCity = null;
        this.searchInput = null;
        this.valueInput = null;
        this.dropdown = null;
        this.isReady = false; // Add ready state
        
        this.init();
    }

    async init() {
        await this.loadCities();
        this.createSelector();
        this.bindEvents();
        this.isReady = true; // Mark as ready
    }

    async loadCities() {
        try {
            // Try multiple possible paths for the JSON file
            const possiblePaths = [
                '../../data/ville.json',
                '../data/ville.json',
                'data/ville.json',
                '/frontend_plain/data/ville.json'
            ];
            
            let cities = [];
            let success = false;
            
            for (const path of possiblePaths) {
                try {
                    const response = await fetch(path);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    cities = data;
                    success = true;
                    // Successfully loaded cities from path
                    break;
                } catch (err) {
                    // Failed to load from path
                }
            }
            
            if (!success) {
                throw new Error('Could not load cities from any path');
            }
            
            this.cities = cities;
            // Sort cities alphabetically
            this.cities.sort((a, b) => a.ville.localeCompare(b.ville));
        } catch (error) {
            // Error loading cities
            this.cities = [];
        }
    }

    createSelector() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="city-selector">
                <input type="text" class="form-control city-search-input" 
                       placeholder="${this.options.placeholder}" 
                       autocomplete="off">
                <input type="hidden" class="city-value-input" id="${this.options.inputId}" name="city" value="">
            </div>
        `;

        this.searchInput = this.container.querySelector('.city-search-input');
        this.valueInput = this.container.querySelector('.city-value-input');

        // Create dropdown as a direct child of body
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'city-dropdown';
        this.dropdown.style.display = 'none';
        this.dropdownContent = document.createElement('div');
        this.dropdownContent.className = 'city-dropdown-content';
        this.dropdown.appendChild(this.dropdownContent);
        document.body.appendChild(this.dropdown);
    }

    bindEvents() {
        if (!this.searchInput) return;

        // Search input events
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        this.searchInput.addEventListener('focus', () => {
            this.showDropdown();
        });

        this.searchInput.addEventListener('blur', () => {
            // Delay hiding to allow click on dropdown items
            setTimeout(() => this.hideDropdown(), 200);
        });

        // Prevent form submission on enter
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (this.filteredCities.length > 0) {
                    this.selectCity(this.filteredCities[0]);
                }
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.hideDropdown();
            }
        });
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (searchTerm.length < this.options.minSearchLength) {
            this.filteredCities = [];
            this.hideDropdown();
            return;
        }

        // Filter cities by name (case-insensitive)
        this.filteredCities = this.cities
            .filter(city => city.ville.toLowerCase().includes(searchTerm))
            .slice(0, this.options.maxResults);

        this.renderDropdown();
        this.showDropdown();
    }

    renderDropdown() {
        if (this.filteredCities.length === 0) {
            this.dropdownContent.innerHTML = `
                <div class="city-no-results">
                    <i class="fas fa-search me-2"></i>
                    ${this.options.noResultsText}
                </div>
            `;
            return;
        }

        this.dropdownContent.innerHTML = this.filteredCities
            .map(city => `
                <div class="city-item" data-city="${city.ville}">
                    <i class="fas fa-map-marker-alt me-2"></i>
                    ${city.ville}
                </div>
            `)
            .join('');

        // Bind click events to city items
        this.dropdownContent.querySelectorAll('.city-item').forEach(item => {
            item.addEventListener('click', () => {
                const cityName = item.dataset.city;
                this.selectCity(this.cities.find(city => city.ville === cityName));
            });
        });
    }

    selectCity(city) {
        if (!city) return;

        this.selectedCity = city;
        this.searchInput.value = city.ville;
        this.valueInput.value = city.ville;
        this.hideDropdown();

        // Trigger change event
        const event = new Event('change', { bubbles: true });
        this.valueInput.dispatchEvent(event);
    }

    showDropdown() {
        if (this.filteredCities.length > 0 && this.searchInput) {
            const rect = this.searchInput.getBoundingClientRect();
            this.dropdown.style.display = 'block';
            this.dropdown.style.position = 'absolute';
            this.dropdown.style.left = `${rect.left + window.scrollX}px`;
            this.dropdown.style.top = `${rect.bottom + window.scrollY}px`;
            this.dropdown.style.width = `${rect.width}px`;
            this.dropdown.style.zIndex = '99999';
        }
    }

    hideDropdown() {
        this.dropdown.style.display = 'none';
    }

    setValue(cityName) {
        if (!cityName) {
            this.clear();
            return false;
        }

        // Check if selector is ready
        if (!this.isReady) {
            // CitySelector not ready yet, cannot set value
            return false;
        }

        // Wait for cities to be loaded
        if (!this.cities || this.cities.length === 0) {
            // Cities not loaded yet, cannot set value
            return false;
        }

        // Normalize the city name for comparison (remove extra spaces, normalize characters)
        const normalizedCityName = cityName.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        // Try exact match first
        let cityExists = this.cities.some(city => city.ville === cityName);
        let foundCity = this.cities.find(city => city.ville === cityName);
        
        // If exact match fails, try normalized comparison
        if (!cityExists) {
            cityExists = this.cities.some(city => {
                const normalizedCity = city.ville.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                return normalizedCity === normalizedCityName;
            });
            if (cityExists) {
                foundCity = this.cities.find(city => {
                    const normalizedCity = city.ville.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    return normalizedCity === normalizedCityName;
                });
            }
        }
        
        if (!cityExists) {
            // City not found in Morocco cities list
            // Available cities: first 10 cities for debugging
            return false;
        }
        
        if (this.searchInput) {
            this.searchInput.value = foundCity.ville; // Use the exact city name from the list
        }
        if (this.valueInput) {
            this.valueInput.value = foundCity.ville; // Use the exact city name from the list
        }
        this.selectedCity = foundCity;
        // City set successfully
        return true;
    }

    getValue() {
        return this.valueInput ? this.valueInput.value : '';
    }

    // Validate if the current value is a valid city from the list
    isValidCity() {
        const currentValue = this.getValue();
        if (!currentValue) return false;
        if (!this.cities || this.cities.length === 0) return false;
        return this.cities.some(city => city.ville === currentValue);
    }

    // Get validation error message
    getValidationError() {
        const currentValue = this.getValue();
        if (!currentValue) {
            return 'City is required';
        }
        if (!this.isValidCity()) {
            return 'Please select a valid city from the list';
        }
        return null;
    }

    // Clear validation state
    clearValidation() {
        if (this.searchInput) {
            this.searchInput.classList.remove('is-invalid');
        }
        // Remove error message
        const errorElement = this.container.querySelector('.city-error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    // Show validation error
    showValidationError(message) {
        if (this.searchInput) {
            this.searchInput.classList.add('is-invalid');
            // Create or update error message
            let errorElement = this.container.querySelector('.city-error-message');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'invalid-feedback city-error-message';
                this.container.appendChild(errorElement);
            }
            errorElement.textContent = message;
        }
    }

    clear() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        if (this.valueInput) {
            this.valueInput.value = '';
        }
        this.selectedCity = null;
        this.hideDropdown();
        this.clearValidation();
    }
}

// Add CSS styles for the city selector
const citySelectorStyles = `
<style>
.city-selector {
    position: relative;
    width: 100%;
}

.city-input-container {
    position: relative;
}

.city-search-input {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: white;
    color: #4a5568;
}

.city-search-input::placeholder {
    color: #a0aec0;
    font-style: italic;
}

.city-search-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.city-search-input.is-invalid {
    border-color: #dc3545;
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.city-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 2px solid #e2e8f0;
    border-top: none;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    z-index: 99999 !important;
    max-height: 300px;
    overflow-y: auto;
    margin-top: -1px;
}

.city-dropdown-content {
    padding: 0.5rem 0;
}

.city-item {
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
    color: #4a5568;
    border-bottom: 1px solid #f7fafc;
}

.city-item:last-child {
    border-bottom: none;
}

.city-item:hover {
    background-color: #f7fafc;
    color: #2d3748;
}

.city-item:active {
    background-color: #edf2f7;
}

.city-item i {
    color: #667eea;
    margin-right: 0.5rem;
}

.city-no-results {
    padding: 1rem;
    text-align: center;
    color: #a0aec0;
    font-style: italic;
}

.city-value-input {
    display: none;
}

.city-error-message {
    display: block;
    width: 100%;
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: #dc3545;
}

.invalid-feedback {
    display: block;
    width: 100%;
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: #dc3545;
}

/* Enhanced styling for search form context */
.doctor-search-form .city-selector .city-search-input {
    background: white;
    border: 2px solid #e2e8f0;
    font-weight: 500;
}

.doctor-search-form .city-selector .city-search-input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.doctor-search-form .city-selector .city-dropdown {
    border-color: #667eea;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .city-dropdown {
        max-height: 250px;
    }
    
    .city-item {
        padding: 0.875rem 1rem;
        font-size: 1rem;
    }
}
</style>
`;

// Inject styles into document head
if (!document.querySelector('#city-selector-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'city-selector-styles';
    styleElement.innerHTML = citySelectorStyles;
    document.head.appendChild(styleElement);
} 