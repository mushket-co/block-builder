# Как опубликовать пакет в npm

## Способ 1: Через GitHub Release (рекомендуется)

1. **Обновите версию в `package.json`**:
   ```bash
   # Вручную измените версию, например: "1.0.2" → "1.0.3"
   ```

2. **Запушьте изменения**:
   ```bash
   git add package.json package-lock.json
   git commit -m "chore: bump version to 1.0.3"
   git push origin master
   ```

3. **Создайте GitHub Release**:
   - Откройте: https://github.com/mushket-co/block-builder/releases/new
   - **Tag**: `v1.0.3` (создайте новый тег)
   - **Title**: `Release v1.0.3`
   - **Description**: Опишите изменения
   - Нажмите **"Publish release"**

4. **Публикация произойдёт автоматически** ✨

## Способ 2: Через ручной запуск (workflow_dispatch)

1. **Откройте GitHub Actions**:
   - https://github.com/mushket-co/block-builder/actions
   - Выберите **"Publish to npm"**
   - Нажмите **"Run workflow"**

2. **Выберите параметры**:
   - **Branch**: `master`
   - **Version**: 
     - `patch` → 1.0.2 → 1.0.3
     - `minor` → 1.0.2 → 1.1.0
     - `major` → 1.0.2 → 2.0.0
     - Или точную версию: `1.0.3`
   - Нажмите **"Run workflow"**

3. **Workflow автоматически**:
   - Обновит версию в `package.json`
   - Запустит тесты
   - Соберёт проект
   - Опубликует в npm
   - Создаст Git тег
   - Создаст GitHub Release

## Проверка публикации

После успешного выполнения workflow:
- Пакет будет доступен в npm: https://www.npmjs.com/package/@mushket-co/block-builder
- Версия будет указана в package.json
- Git тег будет создан
- GitHub Release будет создан

## Текущая версия

Смотрите текущую версию в `package.json`:
```json
{
  "version": "1.0.2"
}
```

## Важно

- ✅ Убедитесь, что `NPM_TOKEN` добавлен в GitHub Secrets
- ✅ CI должен пройти успешно перед публикацией
- ✅ Все изменения должны быть запушены в master

