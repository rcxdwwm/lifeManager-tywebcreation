/**
 * Composant EmptyState pour afficher un état vide
 */

import { cn } from '../../utils/helpers'
import Button from './Button'

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionText,
  className = '',
}) => {
  return (
    <div className={cn('empty-state', className)}>
      {Icon && (
        <div className="empty-state-icon">
          <Icon className="w-full h-full" />
        </div>
      )}

      {title && <h3 className="empty-state-title">{title}</h3>}

      {description && <p className="empty-state-text">{description}</p>}

      {action && actionText && (
        <Button onClick={action} className="mt-4">
          {actionText}
        </Button>
      )}
    </div>
  )
}

export default EmptyState