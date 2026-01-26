var placasLogic = {
    state: {
        placas: [
            { id: 1, number: "ABC-123", description: "Test Plate", whatsapps: ["+123456789"] }
        ]
    },

    init: function () {
        this.render();
        this.attachListeners();
    },

    attachListeners: function () {
        const root = document.getElementById('placas-view-root');
        if (!root) return;

        // Modal elements
        const modal = document.getElementById('add-placa-modal');
        const form = document.getElementById('add-placa-form');
        const cancelBtn = document.getElementById('btn-cancel-add');
        const overlay = document.getElementById('modal-overlay');

        // Prevent multiple attachments
        if (root.dataset.listenersAttached) return;
        root.dataset.listenersAttached = "true";

        root.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            // Global Add Button
            if (target.id === 'btn-add-placa') {
                this.openAddModal();
                return;
            }

            // Delegated actions
            const action = target.dataset.action;
            const id = parseInt(target.dataset.id);
            const index = parseInt(target.dataset.index);

            if (action === 'edit-placa') this.editPlaca(id);
            if (action === 'delete-placa') this.deletePlaca(id);
            if (action === 'add-whatsapp') this.addWhatsapp(id);
            if (action === 'edit-whatsapp') this.editWhatsapp(id, index);
            if (action === 'delete-whatsapp') this.deleteWhatsapp(id, index);
        });

        // Modal Listeners
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeAddModal());
        if (overlay) overlay.addEventListener('click', () => this.closeAddModal());

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePlacaSubmit();
            });
        }
    },

    render: function () {
        const container = document.getElementById('placas-list-container');
        if (!container) return;

        container.innerHTML = this.state.placas.map(placa => `
            <div class="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
                <div class="flex items-center justify-between mb-3">
                    <div>
                        <h3 class="text-xl font-bold text-gray-900">${placa.number}</h3>
                        ${placa.description ? `<p class="text-sm text-gray-600 mt-1">${placa.description}</p>` : ''}
                    </div>
                    <div class="flex gap-2">
                        <button data-action="edit-placa" data-id="${placa.id}" class="p-2 text-blue-600 hover:bg-blue-100 rounded">
                            <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button data-action="delete-placa" data-id="${placa.id}" class="p-2 text-red-600 hover:bg-red-100 rounded">
                            <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
                
                <div class="space-y-2">
                    <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>WhatsApp Numbers</span>
                        <button data-action="add-whatsapp" data-id="${placa.id}" class="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold">
                            <svg class="w-3 h-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                            Add Number
                        </button>
                    </div>
                    ${placa.whatsapps.map((wa, idx) => `
                        <div class="flex items-center justify-between bg-white border border-gray-200 rounded px-3 py-2 text-sm text-gray-800">
                            <span>${wa}</span>
                            <div class="flex gap-2">
                                <button data-action="edit-whatsapp" data-id="${placa.id}" data-index="${idx}" class="text-gray-500 hover:text-blue-600">
                                    <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                </button>
                                <button data-action="delete-whatsapp" data-id="${placa.id}" data-index="${idx}" class="text-gray-500 hover:text-red-600">
                                    <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    openAddModal: function () {
        const modal = document.getElementById('add-placa-modal');
        if (modal) modal.classList.remove('hidden');
    },

    closeAddModal: function () {
        const modal = document.getElementById('add-placa-modal');
        const form = document.getElementById('add-placa-form');
        if (modal) modal.classList.add('hidden');
        if (form) form.reset();
    },

    handlePlacaSubmit: async function () {
        const numberInput = document.getElementById('placa-number');
        const descInput = document.getElementById('placa-description');

        const data = {
            id: Date.now(), // Generate temporary ID
            number: numberInput.value,
            description: descInput.value,
            whatsapps: []
        };

        // Send to API
        try {
            const response = await fetch('http://localhost:3000/placas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                console.error('Failed to send data to API');
                // Optional: Show error to user
            } else {
                console.log('Data sent successfully');
            }
        } catch (error) {
            console.error('Error sending data:', error);
        }

        // Update local state (Optimistic update or waiting for response?)
        // For now, we'll update locally regardless of API success to keep UI responsive,
        // but in production might want to handle errors better.
        this.state.placas.push(data);
        this.render();
        this.closeAddModal();
    },

    deletePlaca: function (id) {
        if (confirm("Are you sure?")) {
            this.state.placas = this.state.placas.filter(p => p.id !== id);
            this.render();
        }
    },

    editPlaca: function (id) {
        const placa = this.state.placas.find(p => p.id === id);
        if (placa) {
            const newNumber = prompt("Edit Plate Number:", placa.number);
            if (newNumber) {
                placa.number = newNumber;
                this.render();
            }
        }
    },

    addWhatsapp: function (placaId) {
        const placa = this.state.placas.find(p => p.id === placaId);
        if (placa) {
            const number = prompt("Enter WhatsApp Number:");
            if (number) {
                placa.whatsapps.push(number);
                this.render();
            }
        }
    },

    editWhatsapp: function (placaId, index) {
        const placa = this.state.placas.find(p => p.id === placaId);
        if (placa) {
            const newNumber = prompt("Edit WhatsApp Number:", placa.whatsapps[index]);
            if (newNumber) {
                placa.whatsapps[index] = newNumber;
                this.render();
            }
        }
    },

    deleteWhatsapp: function (placaId, index) {
        const placa = this.state.placas.find(p => p.id === placaId);
        if (placa) {
            if (confirm("Delete this number?")) {
                placa.whatsapps.splice(index, 1);
                this.render();
            }
        }
    }
};
