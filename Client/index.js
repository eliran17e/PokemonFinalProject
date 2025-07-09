// Load project information when page loads
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadProjectInfo();
    } catch (error) {
        console.error('Error loading project info:', error);
        showErrorMessage();
    }
});

// Fetch and display project information
async function loadProjectInfo() {
    try {
        const response = await fetch('/api/project-info');
        if (!response.ok) {
            throw new Error('Failed to fetch project info');
        }
        
        const projectInfo = await response.json();
        displayProjectInfo(projectInfo);
    } catch (error) {
        console.error('Error fetching project info:', error);
        showErrorMessage();
    }
}

// Display project information on the page
function displayProjectInfo(info) {
    // Update basic info
    document.getElementById('projectTitle').textContent = info.projectName || 'Pokemon Explorer';
    document.getElementById('projectDescription').textContent = info.description || 'Discover, Search, and Collect Your Favorite Pokemon';
    document.getElementById('aboutDescription').textContent = info.description || 'Loading...';
    
    // Display features
    displayFeatures(info.features || []);
    
    // Display technologies
    displayTechnologies(info.technologies || []);
    
    // Display team members
    displayTeamMembers(info.submittedBy || []);
    
    // Display project metadata
    displayProjectMeta(info);
}

// Display features grid
function displayFeatures(features) {
    const featuresGrid = document.getElementById('featuresGrid');
    if (features.length === 0) {
        featuresGrid.innerHTML = '<p>No features information available.</p>';
        return;
    }
    
    featuresGrid.innerHTML = features.map(feature => `
        <div class="feature-card">
            <h4>✨ ${feature}</h4>
        </div>
    `).join('');
}

// Display technology badges
function displayTechnologies(technologies) {
    const techBadges = document.getElementById('techBadges');
    if (technologies.length === 0) {
        techBadges.innerHTML = '<p>No technology information available.</p>';
        return;
    }
    
    techBadges.innerHTML = technologies.map(tech => `
        <span class="tech-badge">${tech}</span>
    `).join('');
}

// Display team members
function displayTeamMembers(members) {
    const teamMembers = document.getElementById('teamMembers');
    if (members.length === 0) {
        teamMembers.innerHTML = '<p>No team information available.</p>';
        return;
    }
    
    teamMembers.innerHTML = members.map(member => `
        <div class="team-member">
            <h4>${member.name}</h4>
            <div class="role">${member.role}</div>
            <div class="email">${member.email}</div>
            ${member.github ? `<div class="github"><a href="${member.github}" target="_blank">GitHub Profile</a></div>` : ''}
            ${member.contributions && member.contributions.length > 0 ? `
                <div class="contributions">
                    <h5>Contributions:</h5>
                    <div class="contribution-tags">
                        ${member.contributions.map(contrib => `
                            <span class="contribution-tag">${contrib}</span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Display project metadata
function displayProjectMeta(info) {
    const projectMeta = document.getElementById('projectMeta');
    const metaHTML = `
        ${info.course ? `<p><strong>Course:</strong> ${info.course}</p>` : ''}
        ${info.institution ? `<p><strong>Institution:</strong> ${info.institution}</p>` : ''}
        ${info.semester ? `<p><strong>Semester:</strong> ${info.semester}</p>` : ''}
        ${info.version ? `<p><strong>Version:</strong> ${info.version}</p>` : ''}
        ${info.startDate && info.completionDate ? `<p><strong>Duration:</strong> ${formatDate(info.startDate)} - ${formatDate(info.completionDate)}</p>` : ''}
        ${info.apiUsed ? `
            <div class="api-info">
                <h4>API Used: ${info.apiUsed.name}</h4>
                <p>${info.apiUsed.description}</p>
                <p><a href="${info.apiUsed.url}" target="_blank">${info.apiUsed.url}</a></p>
            </div>
        ` : ''}
    `;
    
    projectMeta.innerHTML = metaHTML;
}

// Format date for display
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } catch (error) {
        return dateString;
    }
}

// Show error message if project info fails to load
function showErrorMessage() {
    document.getElementById('aboutDescription').textContent = 'Unable to load project information at this time.';
    document.getElementById('featuresGrid').innerHTML = '<p>Features information unavailable.</p>';
    document.getElementById('techBadges').innerHTML = '<p>Technology information unavailable.</p>';
    document.getElementById('teamMembers').innerHTML = '<p>Team information unavailable.</p>';
}

// Add smooth scrolling for better UX
function smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize smooth scrolling
smoothScroll();