# Phase 5.1 — Correctifs informatifs et durcissement CSP

## Objectif

Documenter et traiter les défauts identifiés après la Phase 5 : migration CSP incomplète dans les templates dynamiques et régressions d'accessibilité introduites lors de la Phase 4.

## Constats

- `script-src 'self'` ne doit coexister avec des handlers `onclick`/`onkeydown` générés dynamiquement.
- La vérification CSP doit couvrir les sources JavaScript générant du HTML, pas seulement `index.html`.
- Les composants interactifs rendus dynamiquement doivent conserver leur clavier et leurs attributs sémantiques.
- La navigation active utilise `aria-current="page"` plutôt que `aria-selected` sur les liens de navigation ordinaires.

## Statut informatif

Ce document sert de registre de suivi technique. Il ne remplace pas les issues GitHub et ne constitue pas une demande de fusion.
