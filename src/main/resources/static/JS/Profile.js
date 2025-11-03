// Profile Update Functionality for Dynamic Sections
console.log('✅ Profile script loaded');

// Wait for the profile section to be shown
function setupProfileForm() {
    // Check if profile section exists and is visible
    const profileSection = document.getElementById('profile-section');
    const profileForm = document.getElementById('profileForm');

    console.log('🔍 Looking for profile elements...');
    console.log('Profile section:', profileSection);
    console.log('Profile form:', profileForm);

    if (profileForm && profileSection && profileSection.style.display !== 'none') {
        console.log('✅ Profile form found and visible');

        // Remove existing event listeners to avoid duplicates
        profileForm.replaceWith(profileForm.cloneNode(true));

        // Get the fresh form reference
        const freshForm = document.getElementById('profileForm');
        const fileInput = document.getElementById('profilePhotoInput');

        freshForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await updateProfile();
        });

        // Add file input change listener
        if (fileInput) {
            fileInput.addEventListener('change', handleFileSelect);
        }

        console.log('✅ Form event listener added successfully');
        return true;
    }

    console.log('❌ Profile form not ready yet');
    return false;
}

// Handle file selection and upload
async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    console.log('📁 File selected:', file.name);

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file (JPEG, PNG, etc.)', 'error');
        return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification('File size must be less than 5MB', 'error');
        return;
    }

    try {
        // Show loading state
        showNotification('Uploading image...', 'info');

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('email', '360siddharth@gmail.com');

        // Upload the file
        const uploadResponse = await fetch('/api/listener/upload-profile-picture', {
            method: 'POST',
            body: formData
        });

        if (uploadResponse.ok) {
            const result = await uploadResponse.json();
            console.log('✅ File uploaded successfully:', result);

            // Update the profile photo preview
            const profilePhotoPreview = document.getElementById('profilePhotoPreview');
            if (profilePhotoPreview) {
                profilePhotoPreview.src = result.filePath + '?t=' + Date.now(); // Add timestamp to avoid cache
            }

            // Update the file label
            const label = event.target.nextElementSibling;
            if (label) {
                label.innerHTML = `<i class="fas fa-check me-2"></i>${file.name}`;
            }

            showNotification('Profile picture uploaded successfully!', 'success');
        } else {
            const error = await uploadResponse.text();
            console.error('❌ File upload failed:', error);
            showNotification('Failed to upload image: ' + error, 'error');
        }
    } catch (error) {
        console.error('💥 File upload error:', error);
        showNotification('Error uploading image: ' + error.message, 'error');
    }
}

// Update profile function
async function updateProfile() {
    console.log('🔄 Starting profile update...');

    // Get the values from the form
    const name = document.getElementById('name').value;
    const email = '360siddharth@gmail.com';
    const profilePhoto = document.getElementById('profilePhotoPreview').src;

    console.log('📝 Name:', name);
    console.log('📧 Email:', email);
    console.log('🖼️ Profile Photo:', profilePhoto);

    if (!name || name.trim() === '') {
        showNotification('Name cannot be empty!', 'error');
        return;
    }

    const updates = {
        name: name.trim(),
        profilePhoto: profilePhoto
    };

    console.log('📤 Sending:', updates);

    try {
        const response = await fetch(`/api/listener/update/${email}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates)
        });

        console.log('📡 Response status:', response.status);

        if (response.ok) {
            const result = await response.text();
            console.log('✅ Success:', result);
            showNotification('Profile updated successfully!', 'success');

            // Wait a moment then reload the page
            setTimeout(() => {
                console.log('🔄 Reloading page...');
                window.location.reload();
            }, 1500); // 1.5 second delay to show success message

        } else {
            const error = await response.text();
            console.error('❌ Error:', error);
            showNotification('Failed to update profile: ' + error, 'error');
        }

    } catch (error) {
        console.error('💥 Network error:', error);
        showNotification('Network error: ' + error.message, 'error');
    }
}

// Notification function
function showNotification(message, type) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: type,
            title: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    } else {
        alert(message);
    }
}

// Test function
window.testUpdate = function() {
    console.log('🧪 Testing profile update...');
    updateProfile();
};

// Set up form when profile section is shown
function watchForProfileSection() {
    console.log('👀 Watching for profile section...');

    // Try to set up immediately
    if (setupProfileForm()) {
        console.log('✅ Profile form setup completed');
        return;
    }

    // If not ready, set up an observer to watch for section changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const profileSection = document.getElementById('profile-section');
                if (profileSection && profileSection.classList.contains('active')) {
                    console.log('🎯 Profile section became active!');
                    setupProfileForm();
                }
            }
        });
    });

    // Observe the main content area for changes
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        observer.observe(mainContent, {
            attributes: true,
            subtree: true,
            attributeFilter: ['class']
        });
        console.log('🔍 Observer started');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, starting profile setup...');
    watchForProfileSection();
});

console.log('✅ Profile update script ready. Click on Profile section and then try to update.');