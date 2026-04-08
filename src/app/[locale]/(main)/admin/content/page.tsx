'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, Input, Textarea, Tabs, Modal, Select } from '@/components/ui';

interface ContentItem {
  id: string;
  [key: string]: any;
}

export default function ContentPage() {
  const t = useTranslations('admin.content');
  const [content, setContent] = useState<Record<string, ContentItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/admin/content');
      const data = await response.json();
      setContent(data);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingType) return;

    try {
      const method = editingItem ? 'PUT' : 'POST';
      const body: Record<string, any> = {
        type: editingType,
        ...formData,
      };

      if (editingItem) {
        body.id = editingItem.id;
      }

      const response = await fetch('/api/admin/content', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingItem(null);
        setFormData({});
        fetchContent();
      }
    } catch (error) {
      console.error('Failed to save content:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!editingType) return;

    try {
      const response = await fetch('/api/admin/content', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          type: editingType,
        }),
      });

      if (response.ok) {
        fetchContent();
      }
    } catch (error) {
      console.error('Failed to delete content:', error);
    }
  };

  const openForm = (type: string, item?: ContentItem) => {
    setEditingType(type);
    setEditingItem(item || null);
    setFormData(item ? { ...item } : {});
    setShowForm(true);
  };

  if (loading) {
    return <div className="text-lw-warm-gray">{t('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-lw-charcoal">
        {t('title')}
      </h1>

      <Tabs
        defaultTabId="checklist"
        tabs={[
          {
            id: 'checklist',
            label: t('checklistItems'),
            content: (
              <div className="mt-4 space-y-4">
                <Button
                  variant="primary"
                  onClick={() => openForm('checklist')}
                  className="flex items-center gap-2"
                >
                  <span>➕</span>
                  {t('addItem')}
                </Button>

                <div className="space-y-2">
                  {(content.checklistItems || []).map((item) => (
                    <Card key={item.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lw-charcoal">{item.titleKey}</p>
                        <p className="text-sm text-lw-warm-gray">{item.descriptionKey}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openForm('checklist', item)}
                        >
                          <span>✏️</span>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <span>🗑️</span>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ),
          },
          {
            id: 'guidance',
            label: t('articles'),
            content: (
              <div className="mt-4 space-y-4">
                <Button
                  variant="primary"
                  onClick={() => openForm('guidance')}
                  className="flex items-center gap-2"
                >
                  <span>➕</span>
                  {t('addItem')}
                </Button>

                <div className="space-y-2">
                  {(content.articles || []).map((item) => (
                    <Card key={item.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lw-charcoal">{item.titleKey}</p>
                        <p className="text-sm text-lw-warm-gray">{item.slug}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openForm('guidance', item)}
                        >
                          <span>✏️</span>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <span>🗑️</span>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ),
          },
          {
            id: 'routes',
            label: t('routes'),
            content: (
              <div className="mt-4 space-y-4">
                <Button
                  variant="primary"
                  onClick={() => openForm('routes')}
                  className="flex items-center gap-2"
                >
                  <span>➕</span>
                  {t('addItem')}
                </Button>

                <div className="space-y-2">
                  {(content.routes || []).map((item) => (
                    <Card key={item.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lw-charcoal">{item.name}</p>
                        <p className="text-sm text-lw-warm-gray">
                          {item.distanceKm} km • {item.durationMinutes} min • {item.difficulty}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openForm('routes', item)}
                        >
                          <span>✏️</span>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <span>🗑️</span>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ),
          },
          {
            id: 'badges',
            label: t('badges'),
            content: (
              <div className="mt-4 space-y-4">
                <Button
                  variant="primary"
                  onClick={() => openForm('badges')}
                  className="flex items-center gap-2"
                >
                  <span>➕</span>
                  {t('addItem')}
                </Button>

                <div className="space-y-2">
                  {(content.badges || []).map((item) => (
                    <Card key={item.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lw-charcoal">{item.name}</p>
                        <p className="text-sm text-lw-warm-gray">{item.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openForm('badges', item)}
                        >
                          <span>✏️</span>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <span>🗑️</span>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ),
          },
          {
            id: 'announcements',
            label: t('announcements'),
            content: (
              <div className="mt-4 space-y-4">
                <Button
                  variant="primary"
                  onClick={() => openForm('announcements')}
                  className="flex items-center gap-2"
                >
                  <span>➕</span>
                  {t('addItem')}
                </Button>

                <div className="space-y-2">
                  {(content.announcements || []).map((item) => (
                    <Card key={item.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-lw-charcoal">{item.message}</p>
                        <p className="text-xs text-lw-warm-gray">
                          {item.active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openForm('announcements', item)}
                        >
                          <span>✏️</span>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <span>🗑️</span>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ),
          },
        ]}
      />

      {showForm && editingType && (
        <Modal
          isOpen
          onClose={() => setShowForm(false)}
          title={editingItem ? t('editItem') : t('addItem')}
        >
          <div className="space-y-4">
            {editingType === 'checklist' && (
              <>
                <Input
                  label="Title Key"
                  value={formData.titleKey || ''}
                  onChange={(e) => setFormData({ ...formData, titleKey: e.target.value })}
                />
                <Input
                  label="Description Key"
                  value={formData.descriptionKey || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionKey: e.target.value })
                  }
                />
                <Input
                  label="Category"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
                <Input
                  label="Order"
                  type="number"
                  value={formData.order || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) })
                  }
                />
              </>
            )}

            {editingType === 'guidance' && (
              <>
                <Input
                  label="Title Key"
                  value={formData.titleKey || ''}
                  onChange={(e) => setFormData({ ...formData, titleKey: e.target.value })}
                />
                <Input
                  label="Slug"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
                <Input
                  label="Content Key"
                  value={formData.contentKey || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, contentKey: e.target.value })
                  }
                />
              </>
            )}

            {editingType === 'routes' && (
              <>
                <Input
                  label="Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Distance (km)"
                  type="number"
                  value={formData.distanceKm || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      distanceKm: parseFloat(e.target.value),
                    })
                  }
                />
                <Input
                  label="Duration (min)"
                  type="number"
                  value={formData.durationMinutes || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durationMinutes: parseInt(e.target.value),
                    })
                  }
                />
              </>
            )}

            {editingType === 'badges' && (
              <>
                <Input
                  label="Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Textarea
                  label="Description"
                  value={formData.description || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </>
            )}

            {editingType === 'announcements' && (
              <>
                <Textarea
                  label="Message"
                  value={formData.message || ''}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.active ?? true}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span>{t('active')}</span>
                </label>
              </>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                {t('cancel')}
              </Button>
              <Button variant="primary" onClick={handleSave}>
                {t('save')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
