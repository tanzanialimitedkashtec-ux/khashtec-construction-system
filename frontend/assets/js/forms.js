// ===== FORM MANAGEMENT =====
class FormManager {
    static showCustomForm(title, fields, onSubmit) {
        const modal = document.getElementById('customFormModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalForm = document.getElementById('modalForm');
        const modalSubmit = document.getElementById('modalSubmit');
        const modalCancel = document.getElementById('modalClose');
        const modalCancelBtn = document.getElementById('modalCancel');

        // Set title
        if (modalTitle) modalTitle.textContent = title;

        // Generate form fields
        let formHTML = '';
        fields.forEach(field => {
            const fieldId = `field_${field.name}`;
            formHTML += this.generateField(field, fieldId);
        });

        modalForm.innerHTML = formHTML;

        // Show modal
        modal.style.display = 'block';

        // Handle form submission
        modalForm.onsubmit = (e) => {
            e.preventDefault();
            const formData = this.collectFormData(fields);
            onSubmit(formData);
            this.hideModal();
        };

        // Handle close buttons
        if (modalCancel) {
            modalCancel.onclick = this.hideModal;
        }
        if (modalCancelBtn) {
            modalCancelBtn.onclick = this.hideModal;
        }
    }

    static generateField(field, fieldId) {
        switch (field.type) {
            case 'text':
            case 'email':
            case 'number':
            case 'date':
            case 'tel':
                return `
                    <div class="form-group">
                        <label for="${fieldId}">${field.label}${field.required ? ' *' : ''}</label>
                        <input type="${field.type}" id="${fieldId}" name="${field.name}" 
                               placeholder="${field.placeholder || ''}" 
                               ${field.required ? 'required' : ''} 
                               class="form-control">
                    </div>
                `;
            case 'select':
                return `
                    <div class="form-group">
                        <label for="${fieldId}">${field.label}${field.required ? ' *' : ''}</label>
                        <select id="${fieldId}" name="${field.name}" 
                                ${field.required ? 'required' : ''} 
                                class="form-control">
                            <option value="">Select...</option>
                            ${field.options ? field.options.map(opt => 
                                `<option value="${opt.value}">${opt.label}</option>`
                            ).join('') : ''}
                        </select>
                    </div>
                `;
            case 'textarea':
                return `
                    <div class="form-group">
                        <label for="${fieldId}">${field.label}${field.required ? ' *' : ''}</label>
                        <textarea id="${fieldId}" name="${field.name}" 
                                  placeholder="${field.placeholder || ''}" 
                                  ${field.required ? 'required' : ''} 
                                  rows="4" 
                                  class="form-control"></textarea>
                    </div>
                `;
            default:
                return '';
        }
    }

    static collectFormData(fields) {
        const data = {};
        fields.forEach(field => {
            const element = document.getElementById(`field_${field.name}`);
            if (element) {
                data[field.name] = element.value;
            }
        });
        return data;
    }

    static hideModal() {
        const modal = document.getElementById('customFormModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// Export for global use
window.FormManager = FormManager;
