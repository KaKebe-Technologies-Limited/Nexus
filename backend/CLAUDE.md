# Backend Development Context

**Role**: Backend Developer (Django/DRF)  
**Focus**: API endpoints, database models, authentication, business logic  
**Ignore**: Frontend React components, Next.js routing, Tailwind styling

## My Responsibilities
- Django models and migrations
- DRF ViewSets and serializers
- API endpoint implementation
- Database queries and optimization
- Backend tests with pytest/Django TestCase
- Permission classes and business logic

## Not My Concern
- React components
- Next.js pages
- Frontend state management
- UI/UX implementation
- Tailwind classes

## Quick Commands
```bash
# Run from /backend directory
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py test
```

## Standards
Refer to backend standards in @../CLAUDE.md
