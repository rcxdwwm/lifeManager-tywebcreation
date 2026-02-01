/**
 * Composant ShareModal - Partager la liste de courses
 */

import { useState } from 'react'
import { Mail, MessageSquare, Copy, Check, X } from 'lucide-react'
import { Modal, Button } from '../../../components/common'
import { SHOPPING_CATEGORIES } from '../data/defaultProducts'

const ShareModal = ({ isOpen, onClose, cartItems = [] }) => {
  const [copied, setCopied] = useState(false)

  // Générer le texte de la liste
  const generateListText = () => {
    // Grouper par catégorie
    const itemsByCategory = cartItems.reduce((acc, item) => {
      const categoryId = item.categoryId || 'other'
      if (!acc[categoryId]) {
        acc[categoryId] = []
      }
      acc[categoryId].push(item)
      return acc
    }, {})

    let text = '🛒 LISTE DE COURSES\n'
    text += '─────────────────\n\n'

    Object.entries(itemsByCategory).forEach(([categoryId, items]) => {
      const category = SHOPPING_CATEGORIES.find((c) => c.id === categoryId)
      text += `${category?.icon || '📦'} ${category?.label || 'Autre'}\n`
      items.forEach((item) => {
        const qty = item.quantity > 1 ? ` (x${item.quantity})` : ''
        text += `  • ${item.name}${qty}\n`
      })
      text += '\n'
    })

    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
    text += `─────────────────\n`
    text += `Total: ${totalItems} article${totalItems > 1 ? 's' : ''}`

    return text
  }

  const listText = generateListText()

  // Copier dans le presse-papier
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(listText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erreur copie:', err)
    }
  }

  // Partager par SMS
  const handleSMS = () => {
    const encodedText = encodeURIComponent(listText)
    // Sur iOS, utiliser sms: avec body
    // Sur Android, utiliser sms:?body=
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const smsUrl = isIOS 
      ? `sms:&body=${encodedText}`
      : `sms:?body=${encodedText}`
    window.open(smsUrl, '_blank')
  }

  // Partager par Email
  const handleEmail = () => {
    const subject = encodeURIComponent('Liste de courses')
    const body = encodeURIComponent(listText)
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
  }

  // Utiliser l'API Web Share si disponible
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Liste de courses',
          text: listText,
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Erreur partage:', err)
        }
      }
    }
  }

  const canNativeShare = typeof navigator.share === 'function'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Partager la liste" size="md">
      {/* Aperçu de la liste */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Aperçu
        </label>
        <div className="bg-surface-50 dark:bg-surface-900 rounded-lg p-4 max-h-48 overflow-y-auto">
          <pre className="text-sm text-surface-700 dark:text-surface-300 whitespace-pre-wrap font-mono">
            {listText}
          </pre>
        </div>
      </div>

      {/* Options de partage */}
      <div className="space-y-3">
        {/* Partage natif (mobile) */}
        {canNativeShare && (
          <Button
            variant="primary"
            className="w-full"
            onClick={handleNativeShare}
          >
            Partager...
          </Button>
        )}

        {/* SMS */}
        <Button
          variant="secondary"
          className="w-full"
          leftIcon={MessageSquare}
          onClick={handleSMS}
        >
          Envoyer par SMS
        </Button>

        {/* Email */}
        <Button
          variant="secondary"
          className="w-full"
          leftIcon={Mail}
          onClick={handleEmail}
        >
          Envoyer par Email
        </Button>

        {/* Copier */}
        <Button
          variant="secondary"
          className="w-full"
          leftIcon={copied ? Check : Copy}
          onClick={handleCopy}
        >
          {copied ? 'Copié !' : 'Copier le texte'}
        </Button>
      </div>

      {/* Bouton fermer */}
      <div className="mt-6 pt-4 border-t border-surface-200 dark:border-surface-700">
        <Button variant="ghost" className="w-full" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </Modal>
  )
}

export default ShareModal