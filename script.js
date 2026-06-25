(function() {
    // Elementos
    const passwordInput = document.getElementById('password');
    const copyBtn = document.getElementById('copyBtn');
    const generateBtn = document.getElementById('generateBtn');
    const lengthInput = document.getElementById('length');
    const uppercaseChk = document.getElementById('uppercase');
    const lowercaseChk = document.getElementById('lowercase');
    const numbersChk = document.getElementById('numbers');
    const symbolsChk = document.getElementById('symbols');
    const ambiguousChk = document.getElementById('ambiguous');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    // Conjuntos de caracteres
    const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const LOWER = 'abcdefghijklmnopqrstuvwxyz';
    const NUMBERS = '0123456789';
    const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const AMBIGUOUS = 'il1Lo0O';

    // Função para gerar senha com crypto.getRandomValues (entropia alta)
    function generateSecurePassword(length, useUpper, useLower, useNumbers, useSymbols, avoidAmbiguous) {
        let pool = '';
        if (useUpper) pool += UPPER;
        if (useLower) pool += LOWER;
        if (useNumbers) pool += NUMBERS;
        if (useSymbols) pool += SYMBOLS;

        if (avoidAmbiguous) {
            // Remove caracteres ambíguos do pool
            for (let ch of AMBIGUOUS) {
                pool = pool.replaceAll(ch, '');
            }
        }

        // Se nenhuma opção marcada, usa todas por padrão
        if (pool === '') {
            pool = UPPER + LOWER + NUMBERS + SYMBOLS;
            if (avoidAmbiguous) {
                for (let ch of AMBIGUOUS) {
                    pool = pool.replaceAll(ch, '');
                }
            }
        }

        // Garante que o pool não fique vazio (caso extremo)
        if (pool.length === 0) pool = UPPER + LOWER + NUMBERS; // fallback

        let password = '';
        const poolSize = pool.length;
        // Usa array de uint32 para randomização criptográfica
        const randomValues = new Uint32Array(length);
        crypto.getRandomValues(randomValues);

        for (let i = 0; i < length; i++) {
            const randomIndex = randomValues[i] % poolSize;
            password += pool[randomIndex];
        }

        return password;
    }

    // Avaliar força da senha
    function evaluateStrength(password) {
        let score = 0;
        const len = password.length;

        // Comprimento
        if (len >= 20) score += 3;
        else if (len >= 16) score += 2;
        else if (len >= 12) score += 1;

        // Variedade de caracteres
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/\d/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;

        // Força
        if (score <= 2) return { label: 'Fraca', color: '#ef4444', width: '25%' };
        else if (score <= 4) return { label: 'Média', color: '#f59e0b', width: '50%' };
        else if (score <= 6) return { label: 'Forte', color: '#22c55e', width: '75%' };
        else return { label: 'Excelente', color: '#22d3ee', width: '100%' };
    }

    // Atualizar indicador de força
    function updateStrength(password) {
        if (!password) {
            strengthFill.style.width = '0%';
            strengthFill.style.background = '#475569';
            strengthText.textContent = 'Força: -';
            return;
        }
        const result = evaluateStrength(password);
        strengthFill.style.width = result.width;
        strengthFill.style.background = result.color;
        strengthText.textContent = `Força: ${result.label}`;
    }

    // Gerar e exibir senha
    function generateAndDisplay() {
        const length = parseInt(lengthInput.value) || 16;
        const useUpper = uppercaseChk.checked;
        const useLower = lowercaseChk.checked;
        const useNumbers = numbersChk.checked;
        const useSymbols = symbolsChk.checked;
        const avoidAmbiguous = ambiguousChk.checked;

        // Validação de comprimento
        const clampedLength = Math.min(128, Math.max(8, length));
        lengthInput.value = clampedLength;

        const password = generateSecurePassword(
            clampedLength,
            useUpper,
            useLower,
            useNumbers,
            useSymbols,
            avoidAmbiguous
        );

        passwordInput.value = password;
        updateStrength(password);
    }

    // Copiar senha
    function copyPassword() {
        const password = passwordInput.value;
        if (!password) {
            alert('Nenhuma senha gerada para copiar.');
            return;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(password)
                .then(() => {
                    // Feedback visual rápido
                    const original = copyBtn.textContent;
                    copyBtn.textContent = '✅';
                    setTimeout(() => copyBtn.textContent = original, 1500);
                })
                .catch(() => fallbackCopy(password));
        } else {
            fallbackCopy(password);
        }
    }

    // Fallback para navegadores sem clipboard API
    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            const original = copyBtn.textContent;
            copyBtn.textContent = '✅';
            setTimeout(() => copyBtn.textContent = original, 1500);
        } catch (err) {
            alert('Não foi possível copiar. Selecione e copie manualmente.');
        }
        document.body.removeChild(textarea);
    }

    // Event listeners
    generateBtn.addEventListener('click', generateAndDisplay);
    copyBtn.addEventListener('click', copyPassword);

    // Gerar ao carregar a página
    window.addEventListener('DOMContentLoaded', generateAndDisplay);

    // Atualizar automaticamente quando as opções mudarem (opcional)
    [lengthInput, uppercaseChk, lowercaseChk, numbersChk, symbolsChk, ambiguousChk].forEach(el => {
        el.addEventListener('change', generateAndDisplay);
    });
    // Para o input number, também escuta input
    lengthInput.addEventListener('input', generateAndDisplay);
})();
