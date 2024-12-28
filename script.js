// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA7CNhqzkYggagv3fUB5_QaKut2F-tzpiY",
    authDomain: "bigshot-cb838.firebaseapp.com",
    databaseURL: "https://bigshot-cb838-default-rtdb.firebaseio.com",
    projectId: "bigshot-cb838",
    storageBucket: "bigshot-cb838.firebasestorage.app",
    messagingSenderId: "1029508559269",
    appId: "1:1029508559269:web:9439ed20d9adf46eda784c",
    measurementId: "G-0S7X2F9HL0"
  };

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Funções de cálculo
function atualizarPontos() {
    const inteligencia = parseInt(document.getElementById('inteligencia').value) || 0;
    const forca = parseInt(document.getElementById('forca').value) || 0;
    const agilidade = parseInt(document.getElementById('agilidade').value) || 0;
    const determinacao = parseInt(document.getElementById('determinacao').value) || 0;

    const pontosUsados = inteligencia + forca + agilidade + determinacao;
    const pontosRestantes = 5 - pontosUsados;

    document.getElementById('pontosRestantes').textContent = pontosRestantes;
    
    // Atualizar vida
    const vidaTotal = 10 + forca + determinacao;
    document.getElementById('vidaTotal').textContent = vidaTotal;

    return pontosRestantes;
}

// Adicionar listeners para os inputs
document.querySelectorAll('.atributo input').forEach(input => {
    input.addEventListener('change', function() {
        if (this.value < 0) this.value = 0;
        if (this.value > 5) this.value = 5;
        atualizarPontos();
    });
});

// Painel Admin
document.addEventListener('keydown', function(e) {
    console.log('Tecla pressionada:', e.key); // Debug
    if (e.key === 'F2') {
        e.preventDefault();
        const senha = prompt('Digite a senha de administrador:');
        if (senha === 'BIGSHOT@2016') {
            const adminPanel = document.getElementById('adminPanel');
            if (adminPanel.style.display === 'none' || adminPanel.style.display === '') {
                adminPanel.style.display = 'block';
                carregarFichas();
            } else {
                adminPanel.style.display = 'none';
            }
        }
    }
});

// Carregar fichas
function carregarFichas() {
    const fichasSalvas = document.getElementById('fichasSalvas');
    fichasSalvas.innerHTML = 'Carregando...';

    db.ref('fichas').once('value').then((snapshot) => {
        fichasSalvas.innerHTML = '';
        
        if (!snapshot.exists()) {
            fichasSalvas.innerHTML = '<p>Nenhuma ficha encontrada.</p>';
            return;
        }

        snapshot.forEach((childSnapshot) => {
            const ficha = childSnapshot.val();
            const div = document.createElement('div');
            div.className = 'ficha-salva';
            div.innerHTML = `
                <h3>Jogador: ${ficha.nome}</h3>
                <div class="ficha-info">
                    <p><strong>Idade:</strong> ${ficha.idade}</p>
                    <p><strong>Trabalho:</strong> ${ficha.trabalho}</p>
                    <p><strong>Descrição:</strong> ${ficha.descricao}</p>
                    
                    <div class="atributos-admin">
                        <h4>Atributos:</h4>
                        <p><strong>Inteligência:</strong> ${ficha.inteligencia}</p>
                        <p><strong>Força:</strong> ${ficha.forca}</p>
                        <p><strong>Agilidade:</strong> ${ficha.agilidade}</p>
                        <p><strong>Determinação:</strong> ${ficha.determinacao}</p>
                        <p class="vida-total"><strong>Vida Total:</strong> ${ficha.vida}</p>
                    </div>
                </div>
                <button onclick="deletarFicha('${childSnapshot.key}')" class="delete-btn">Deletar Ficha</button>
            `;
            fichasSalvas.appendChild(div);
        });
    });
}

// Deletar ficha
function deletarFicha(key) {
    if (confirm('Deletar esta ficha?')) {
        db.ref('fichas/' + key).remove();
    }
}

// Submit do formulário
document.getElementById('fichaForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const pontosRestantes = atualizarPontos();
    if (pontosRestantes !== 0) {
        alert('Você deve usar exatamente 5 pontos!');
        return;
    }

    const ficha = {
        nome: document.getElementById('nome').value,
        idade: document.getElementById('idade').value,
        trabalho: document.getElementById('trabalho').value,
        descricao: document.getElementById('descricao').value,
        inteligencia: parseInt(document.getElementById('inteligencia').value) || 0,
        forca: parseInt(document.getElementById('forca').value) || 0,
        agilidade: parseInt(document.getElementById('agilidade').value) || 0,
        determinacao: parseInt(document.getElementById('determinacao').value) || 0,
        vida: parseInt(document.getElementById('vidaTotal').textContent)
    };

    db.ref('fichas').push(ficha)
        .then(() => {
            alert('Ficha salva com sucesso!');
            this.reset();
            atualizarPontos();
        })
        .catch(error => {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar ficha!');
        });
});

// Inicializar
window.onload = atualizarPontos; 