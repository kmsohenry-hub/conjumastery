## 2026-08-31 - Imported state identifiers

**Vulnérabilité :** Les journaux et la répétition espacée d'une sauvegarde importée acceptaient des identifiants arbitraires, ensuite interpolés dans des rendus HTML.

**Apprentissage :** Les objets de sauvegarde sont une frontière de confiance, même dans une application locale.

**Prévention :** Filtrer les identifiants importés avec les clés reconnues par les données de l'application avant de les stocker ou de les afficher.
