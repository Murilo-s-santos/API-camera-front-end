document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('webcam');
    const statusMessage = document.getElementById('status-message');
    const btnToggleCamera = document.getElementById('btn-toggle-camera');
    const btnTakePhoto = document.getElementById('btn-take-photo');
    const filterButtons = document.querySelectorAll('.filter-btn');

    let stream = null;
    let currentFilter = 'none';

    // Gerencia o acionamento da câmera
    btnToggleCamera.addEventListener('click', async () => {
        if (stream) {
            stopCamera();
        } else {
            await startCamera();
        }
    });

    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
                audio: false 
            });
            
            video.srcObject = stream;
            video.classList.add('active');
            statusMessage.style.display = 'none';
            
            btnToggleCamera.textContent = 'Desligar câmera';
            btnToggleCamera.classList.add('active');
            
            // Habilita o botão de tirar foto
            btnTakePhoto.disabled = false;
        } catch (error) {
            console.error('Erro ao acessar a câmera:', error);
            alert('Não foi possível acessar a câmera. Verifique as permissões do seu navegador.');
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        
        video.srcObject = null;
        video.classList.remove('active');
        statusMessage.style.display = 'block';
        
        btnToggleCamera.textContent = 'Ligar câmera';
        btnToggleCamera.classList.remove('active');
        
        // Desabilita o botão de foto e reseta filtros
        btnTakePhoto.disabled = true;
        video.style.filter = 'none';
        currentFilter = 'none';
        updateActiveFilterButton(document.querySelector('[data-filter="none"]'));
    }

    // Gerencia a aplicação dinâmica dos filtros CSS
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentFilter = button.getAttribute('data-filter');
            video.style.filter = currentFilter;
            updateActiveFilterButton(button);
        });
    });

    function updateActiveFilterButton(activeBtn) {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    // Lógica para capturar e baixar a foto
    btnTakePhoto.addEventListener('click', () => {
        // Cria um canvas temporário (invisível) em memória
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');

        // Aplica o filtro atual ao contexto do canvas antes de desenhar
        ctx.filter = currentFilter;

        // Como o vídeo está espelhado no CSS (scaleX(-1)), espelhamos no canvas também
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);

        // Desenha o frame atual do vídeo no canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Gera a imagem e aciona o download
        const link = document.createElement('a');
        link.download = 'minha-foto-com-filtro.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});