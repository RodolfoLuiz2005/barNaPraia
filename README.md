# Maré Pina Beach Bar — Site demonstrativo

Site profissional, moderno e responsivo para restaurante/bar de praia com foco em experiência mobile, cardápio digital, QR Code por mesa, carrinho e envio de pedidos pelo WhatsApp.

## Arquivos principais

- `index.html` — página principal do site.
- `style.css` — estilos responsivos, animações e layout.
- `script.js` — cardápio, carrinho, WhatsApp, QR Code por mesa, galeria e reserva.
- `admin.html` — painel admin demonstrativo.
- `admin.js` — edição de produtos, configurações e pedidos simulados via localStorage.
- `assets/images` — placeholders em SVG para praia, pratos, drinks, galeria e mapa.
- `assets/icons` — ícone do projeto.

## Como usar

Abra `index.html` no navegador ou use a extensão Live Server no VS Code.

Para testar QR Code por mesa, use:

```txt
index.html?mesa=08
index.html?mesa=guarda-sol-12
```

O campo Mesa/Guarda-sol será preenchido automaticamente no carrinho.

## Como alterar o WhatsApp

Você pode alterar de duas formas:

1. No arquivo `script.js`, edite:

```js
DEFAULT_SETTINGS.whatsapp = "5581999999999";
```

2. Pelo painel `admin.html`, usando a senha demonstrativa:

```txt
praia123
```

## Painel admin

O painel usa `localStorage`, então as alterações ficam salvas no navegador atual. Ele permite:

- alterar WhatsApp;
- alterar horário;
- alterar link do Google Maps;
- adicionar/remover produtos;
- editar nomes, categorias, preços, descrições e imagens;
- visualizar pedidos simulados enviados pelo site.

Em produção, substitua o login fictício por autenticação real e integre Firebase, Supabase ou um backend próprio.

## Observação sobre marca e imagens

Este projeto é inspirado na energia comercial de bares de praia do Pina, Recife. Ele não copia imagens, textos ou identidade de terceiros. Todas as imagens são placeholders SVG e devem ser substituídas por fotos reais autorizadas do restaurante.
