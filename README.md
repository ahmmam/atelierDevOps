# Atelier DevOps : "GOAT Vote" - de zéro à CI/CD complet (≈ 7 h)

> **Objectif général** : construire et déployer une application micro‑services *Python/React* sur un cluster Kubernetes local (Docker Desktop + WSL 2), puis mettre en place une chaîne CI/CD GitLab et une analyse de code SonarQube.
>
> ➜ A la fin de l’atelier, vous disposerez :\
>   • d’un environnement Kubernetes fonctionnel,\
>   • d’une appli conteneurisée (4 services),\
>   • d’un pipeline GitLab (build → test → déploiement Helm),\
>   • d’une analyse Qualité SonarQube intégrée.

---

## 0. Pré‑requis (30 min)

| Outil                                        | Version mini | Checklist                                    |
| -------------------------------------------- | ------------ | -------------------------------------------- |
| **Windows 10/11** + **WSL 2** (Ubuntu)       | -            |  `wsl --status`                              |
| **Docker Desktop**                           |  4.30 +      |  Kubernetes activé, 8 Go RAM & 4 CPU alloués |
| **kubectl** / **helm**                       | 1.30 +       |  `kubectl version --client` / `helm version` |
| **Git** / **Node.js 18+** / **Python 3.11+** | -            |  `git --version`, `node -v`, `python3 -V`    |

>  *Astuce* : placez vos sources dans `\wsl$\Ubuntu\home\…` pour des builds plus rapides qu’en `C:\`.

---

## 1. Découverte du projet (45 min)

### 1.1 – Présentation fonctionnelle

- **Vote GOAT** : « Messi vs Cruyff » ; chaque vote incrémente un compteur.
- 4 services à créer :
  1. **backend** (FastAPI) : gateway HTTP ; endpoints `/vote/{player}` et `/scores`.
  2. **api** (FastAPI + Postgres) : persistance des votes.
  3. **frontend** (React + Vite) : SPA avec deux photos plein écran.
  4. **db** : Postgres 16.

### 1.2 – Arborescence cible

```
goat-vote/
├── backend/        # FastAPI
├── api/            # FastAPI + asyncpg
├── frontend/       # React + Vite
└── db/             # scripts SQL init
```

>  **à faire** : initialisez un dépôt Git vide et poussez‑le vers un *remote* GitHub/GitLab privé.

*Hints* :

- Vous pouvez démarrer les applis Python en mode « single‑file » (`main.py`) pour aller vite.
- Gardez la logique métier minimale : un `UPDATE votes SET count = count + 1 …` suffit.

---

## 2. Conteneurisation Docker (60 min)

### 2.1 – Dockerfiles

- **backend** et **api** : multi‑stage Python 3.11‑slim ; installez les dépendances via `requirements.txt`.
- **frontend** : build Node 20‑alpine → runtime nginx‑alpine.
- **db** : image officielle Postgres 16‑alpine + scripts init.

>  *Pièges fréquents* :
>
> - Oublier `.dockerignore` ➜ build lent.
> - Var env `POSTGRES_PORT` auto‑générée par K8s ➜ écrase vos propres vars.

### 2.2 – Docker Compose (dev)

- Rédigez un `docker-compose.yml` exposant :
  - frontend : `3000:80`
  - backend : `8000:8000`
  - api : `9000:9000`
  - db : `5432:5432`

*Hints* :

- Utilisez `depends_on` pour l’ordre de démarrage.
- Test : `curl http://localhost:8000/scores` doit retourner `{ ... }`.

---

## 3. Kubernetes local (1 h 15)

### 3.1 – Namespace & ressources

1. Créez le namespace : `goat-vote`.
2. Postgres : StatefulSet + PVC 1 GiB.
3. Deployments + Services pour backend, api, frontend.
4. Ingress NGINX : host `goatvote.local` ➜ frontend.

>  *Astuce* : pour un LB local, mettez `type: LoadBalancer` sur le service frontend (Docker Desktop crée une IP 127.0.0.X).

### 3.2 – Validation

- `kubectl get pods -n goat-vote` ➜ tous en *Running*.
- Vérifiez la barre de votes dans le navigateur.

*Bonus* : convertissez vos manifests en **Helm Chart** (facultatif, 20 min).

---

## 4. GitLab auto‑hébergé (45 min)

### 4.1 – Installation

- Ajoutez le repo Helm `https://charts.gitlab.io`.
- Déployez (`helm upgrade --install gitlab …`) dans le namespace `gitlab` avec :
  - RAM réduite (prometheus=false, registry=false).
  - Runner Kubernetes internal.

>  Le premier pod peut prendre 10‑15 min.

### 4.2 – Premier push

1. Ajoutez `origin http://gitlab.local/...` à votre repo.
2. Créez un projet vide et *push* votre code.

---

## 5. CI/CD : pipeline Docker → Helm (1 h)

### 5.1 – étape **build**

- Image `docker:24` + service `docker:dind`.
- Construit/pousse 3 images `backend`, `api`, `frontend` dans le *Container Registry* GitLab.

*Hint* : utilisez `$CI_REGISTRY_IMAGE/<service>:${CI_COMMIT_SHORT_SHA}`.

### 5.2 – étape **deploy**

- Image `bitnami/kubectl`.
- Commande : `helm upgrade --install goat-vote ./chart … --set image.tag=$CI_COMMIT_SHORT_SHA`.

>  **Droits** : créez un `ClusterRoleBinding` *cluster‑admin* pour le ServiceAccount runner.

---

## 6. SonarQube (45 min)

### 6.1 – Déploiement

- Helm chart Bitnami (namespace `sonar`).
- Ingress `sonar.local` + token admin.

### 6.2 – étape **analyze** dans `.gitlab-ci.yml`

```yaml
sonarqube:
  image: sonarsource/sonar-scanner-cli:5.0
  stage: analyze
  variables:
    SONAR_HOST_URL: http://sonar.local
    SONAR_TOKEN:   <à renseigner dans CI/CD > Variables>
  script:
    - sonar-scanner -Dsonar.projectKey="goat-vote" …
```

>  *Astuce* : placez le stage `analyze` avant `build` pour bloquer en cas d’échec *Quality Gate*.

---

## 7. Rétro & amélioration continue (30 min)

| Idée                       | Challenge                                                  |
| -------------------------- | ---------------------------------------------------------- |
| Tests unitaires + coverage | Ajouter un job `pytest --cov` + rapport JUnit dans GitLab. |
| Container Registry privé   | Activer `registry.enabled=true` dans GitLab Helm.          |
| Auto TLS local             | mkcert + Ingress cert‑manager.                             |
| Monitoring                 | Prometheus + Grafana via kube‑prometheus‑stack.            |

---


\
\

**Bon atelier !**\
*N’oubliez pas de commit/push à chaque checkpoint et de partager vos questions en live.*

