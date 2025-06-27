/**
 * Book Appointment Page JavaScript
 * Handles doctor search, filtering, pagination, doctor details modal, and booking functionality
 */

class BookAppointmentPage {
    constructor() {
        this.doctors = [];
        this.currentPage = 0;
        this.pageSize = 20;
        this.hasMore = true;
        this.loading = false;
        this.searchParams = { firstName: '', lastName: '', city: '', specialization: '' };
        this.citySelector = null;
        this.init();
    }

    async init() {
        const isAuth = await authService.requireAuth('../../pages/auth/login.html');
        if (!isAuth) return;
        this.initializeCitySelector();
        this.setupEventListeners();
        this.loadUserInfo();
        await this.fetchAndRenderDoctors(true);
        this.setupInfiniteScroll();
    }

    initializeCitySelector() {
        // Initialize city selector
        this.citySelector = new CitySelector('citySelectorContainer', {
            placeholder: 'Search for a city...',
            noResultsText: 'No cities found',
            minSearchLength: 1,
            maxResults: 10
        });
    }

    setupEventListeners() {
        document.getElementById('doctorSearchForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const searchBtn = document.getElementById('searchBtn');
            const searchBtnText = document.getElementById('searchBtnText');
            const searchBtnSpinner = document.getElementById('searchBtnSpinner');
            searchBtn.disabled = true;
            searchBtnText.classList.add('d-none');
            searchBtnSpinner.classList.remove('d-none');
            await this.handleSearch();
            searchBtn.disabled = false;
            searchBtnText.classList.remove('d-none');
            searchBtnSpinner.classList.add('d-none');
        });
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            authService.logout();
        });
    }

    handleSearch() {
        // Validate city if provided
        const cityValue = this.citySelector ? this.citySelector.getValue() : '';
        if (cityValue && this.citySelector && !this.citySelector.isValidCity()) {
            this.citySelector.showValidationError('Please select a valid city from the list');
            return;
        }
        
        this.searchParams = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            city: cityValue,
            specialization: document.getElementById('specialization').value.trim()
        };
        this.currentPage = 0;
        this.hasMore = true;
        this.doctors = [];
        this.clearDoctorsGrid();
        this.fetchAndRenderDoctors(true);
    }

    async fetchAndRenderDoctors(reset = false) {
        if (this.loading || !this.hasMore) return;
        this.loading = true;
        this.showLoading(true);
        try {
            const params = new URLSearchParams({
                ...this.searchParams,
                page: this.currentPage,
                size: this.pageSize
            });
            const response = await api.get(`/api/doctors?${params.toString()}`);
            const newDoctors = response.data.content || response.data || [];
            if (reset) {
                this.doctors = newDoctors;
            } else {
                this.doctors = [...this.doctors, ...newDoctors];
            }
            this.hasMore = newDoctors.length === this.pageSize;
            this.renderDoctors();
        } catch (error) {
            notificationService.error('Failed to load doctors');
        } finally {
            this.loading = false;
            this.showLoading(false);
        }
    }

    renderDoctors() {
        const grid = document.getElementById('doctorsGrid');
        const noResults = document.getElementById('noResults');
        if (!this.doctors.length) {
            grid.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }
        noResults.style.display = 'none';
        grid.innerHTML = this.doctors.map(doctor => this.createDoctorCard(doctor)).join('');
    }

    clearDoctorsGrid() {
        document.getElementById('doctorsGrid').innerHTML = '';
    }

    showLoading(show) {
        document.getElementById('loadingState').style.display = show ? 'block' : 'none';
    }

    setupInfiniteScroll() {
        window.addEventListener('scroll', () => {
            if (this.loading || !this.hasMore) return;
            const scrollY = window.scrollY || window.pageYOffset;
            const viewportHeight = window.innerHeight;
            const fullHeight = document.body.offsetHeight;
            if (scrollY + viewportHeight + 200 >= fullHeight) {
                this.currentPage++;
                this.fetchAndRenderDoctors();
            }
        });
    }

    createDoctorCard(doctor) {
        const fullName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
        const avatarUrl = doctor.profilePictureUrl ?
            doctor.profilePictureUrl :
            '/assets/images/default-avatar.png';
        return `
            <div class="col-xl-3 col-md-4 col-12 mb-4 d-flex align-items-stretch">
                <div class="card w-100 doctor-card">
                    <img src="${avatarUrl}" class="card-img-top" alt="${fullName}">
                    <div class="card-body">
                        <span class="specialty-badge mb-2">${doctor.doctorProfileDTO?.specialty || 'General'}</span>
                        <h5 class="card-title">Dr. ${fullName}</h5>
                        <p class="card-text mb-1"><strong>City:</strong> ${doctor.city || '-'}</p>
                        <p class="card-text mb-1"><strong>Experience:</strong> ${doctor.doctorProfileDTO?.experience || 0} years</p>
                        <a class="btn btn-primary btn-sm w-100 mt-2" href="doctor-profile.html?id=${doctor.id}">
                            <i class="bi bi-person-lines-fill me-1"></i>Visit Profile
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    loadUserInfo() {
        const user = authService.getUser();
        if (user) {
            const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
            const userNameSpan = document.getElementById('userName');
            if (userNameSpan) userNameSpan.textContent = userName;
        }
    }

    // Dummy booking function (replace with modal logic as needed)
    bookAppointment(doctorId) {
        alert('Book appointment for doctor ID: ' + doctorId);
    }
}

let bookAppointmentPage;
document.addEventListener('DOMContentLoaded', () => {
    bookAppointmentPage = new BookAppointmentPage();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BookAppointmentPage;
} 