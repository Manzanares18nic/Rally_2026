import React, { useState } from 'react';
import {
  MessageSquare,
  Heart,
  Share2,
  Image as ImageIcon,
  Send,
  PlusCircle,
  Leaf,
  AlertTriangle,
  Sparkles,
  MapPin,
  CheckCircle2,
  X,
  Upload,
} from 'lucide-react';

export interface ForumComment {
  id: string;
  author: string;
  time: string;
  text: string;
}

export interface ForumPost {
  id: string;
  author: string;
  role: string;
  neighborhood: string;
  time: string;
  category: 'INFRAESTRUCTURA_VERDE' | 'DRENAJE_ALERTA' | 'LIMPIEZA_BARRIAL';
  title: string;
  description: string;
  photoUrl: string;
  likes: number;
  hasLiked: boolean;
  comments: ForumComment[];
}

const INITIAL_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    author: 'Doña Carmen Mendoza',
    role: 'Comité Barrial Sabana Grande',
    neighborhood: 'Sector Cauce La Maravilla',
    time: 'Hace 45 min',
    category: 'INFRAESTRUCTURA_VERDE',
    title: 'Propuesta de Jardín de Bio-Retención en la entrada peatonal',
    description:
      'Vecinos, proponemos sembrar pasto vetiver y plantas filtrantes nativas en la orilla del callejón antes de que el agua llegue al cauce. Así frenamos el barro y las botellas plásticas que atoran la alcantarilla.',
    photoUrl: '/images/reservorio1.jpeg',
    likes: 18,
    hasLiked: false,
    comments: [
      {
        id: 'c1',
        author: 'Don Ricardo Silva',
        time: 'Hace 30 min',
        text: '¡Excelente iniciativa! Yo tengo piedras bola y tierra negra para colaborar este sábado.',
      },
      {
        id: 'c2',
        author: 'Ing. Municipal D-VI',
        time: 'Hace 15 min',
        text: 'Propuesta registrada para apoyo técnico de la alcaldía con asesoría de zanjas de infiltración.',
      },
    ],
  },
  {
    id: 'post-2',
    author: 'Marcos Torrez',
    role: 'Vigía Comunitario',
    neighborhood: 'Barrio 31 de Diciembre',
    time: 'Hace 2 horas',
    category: 'DRENAJE_ALERTA',
    title: 'Limpieza preventiva en la rejilla de captación norte',
    description:
      'Logramos retirar varias ramas y bolsas plásticas acumuladas tras el chubasco de anoche. El cauce está corriendo libre hacia la microrrepresa, pero ocupamos que no sigan tirando desechos en la esquina.',
    photoUrl: '/images/reservorio2.jpeg',
    likes: 24,
    hasLiked: true,
    comments: [
      {
        id: 'c3',
        author: 'Elena Morales',
        time: 'Hace 1 hora',
        text: 'Gracias muchachos por la labor. Avisaremos al grupo de WhatsApp para que nadie saque basura fuera de horario.',
      },
    ],
  },
  {
    id: 'post-3',
    author: 'Comité Ambiental Sabana Grande',
    role: 'Iniciativa Comunitaria',
    neighborhood: 'Pista Sabana Grande Sur',
    time: 'Hace 4 horas',
    category: 'INFRAESTRUCTURA_VERDE',
    title: 'Instalación de barriles de cosecha de lluvia en 6 viviendas',
    description:
      'Conectamos las bajantes de los techos a barriles con filtro de arena. Cada vivienda está reteniendo hasta 600 litros por lluvia fuerte, aliviando la correntada de la pista principal.',
    photoUrl: '/images/reservorio3.jpg',
    likes: 31,
    hasLiked: false,
    comments: [
      {
        id: 'c4',
        author: 'Carlos Gutiérrez',
        time: 'Hace 3 horas',
        text: '¿Dónde puedo conseguir los filtros de arena? Me gustaría instalar uno en mi patio.',
      },
    ],
  },
];

interface CommunityForumProps {
  isDark: boolean;
}

export const CommunityForum: React.FC<CommunityForumProps> = ({ isDark }) => {
  const [posts, setPosts] = useState<ForumPost[]>(INITIAL_POSTS);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'VERDE' | 'DRENAJE'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Formulario de nueva publicación
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState<'INFRAESTRUCTURA_VERDE' | 'DRENAJE_ALERTA' | 'LIMPIEZA_BARRIAL'>('INFRAESTRUCTURA_VERDE');
  const [newPhotoUrl, setNewPhotoUrl] = useState('/images/reservorio1.jpeg');
  const [newCommentTexts, setNewCommentTexts] = useState<{ [postId: string]: string }>({});

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const hasLiked = !p.hasLiked;
          return {
            ...p,
            hasLiked,
            likes: hasLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId: string) => {
    const text = newCommentTexts[postId]?.trim();
    if (!text) return;

    const newComment: ForumComment = {
      id: `c-${Date.now()}`,
      author: 'Vecino Participante',
      time: 'Justo ahora',
      text,
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...p.comments, newComment],
          };
        }
        return p;
      })
    );

    setNewCommentTexts((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) return;

    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      author: newAuthor || 'Vecino de Sabana Grande',
      role: newCategory === 'INFRAESTRUCTURA_VERDE' ? 'Promotor Bio-Retención' : 'Vigía Vecinal',
      neighborhood: 'Distrito VI, Sabana Grande',
      time: 'Justo ahora',
      category: newCategory,
      title: newTitle,
      description: newDescription,
      photoUrl: newPhotoUrl || '/images/reservorio1.jpeg',
      likes: 1,
      hasLiked: true,
      comments: [],
    };

    setPosts([newPost, ...posts]);
    setNewTitle('');
    setNewDescription('');
    setNewAuthor('');
    setIsCreateModalOpen(false);
  };

  const filteredPosts = posts.filter((p) => {
    if (activeFilter === 'VERDE') return p.category === 'INFRAESTRUCTURA_VERDE';
    if (activeFilter === 'DRENAJE') return p.category === 'DRENAJE_ALERTA' || p.category === 'LIMPIEZA_BARRIAL';
    return true;
  });

  return (
    <div className="space-y-5 max-w-4xl mx-auto py-2">
      {/* Cabecera del Foro Comunitario */}
      <div
        className={`rounded-2xl border p-5 md:p-6 transition-all shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Muro Comunitario e Infraestructura Verde</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Espacio vecinal para proponer bio-jardines, coordinar limpiezas y reportar problemáticas del cauce
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publicar en el Foro</span>
        </button>
      </div>

      {/* Filtros de Categoría */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
            activeFilter === 'ALL'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Todas las publicaciones ({posts.length})
        </button>

        <button
          onClick={() => setActiveFilter('VERDE')}
          className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
            activeFilter === 'VERDE'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Leaf className="w-3.5 h-3.5" />
          <span>Infraestructura Verde</span>
        </button>

        <button
          onClick={() => setActiveFilter('DRENAJE')}
          className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
            activeFilter === 'DRENAJE'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Alertas y Drenaje</span>
        </button>
      </div>

      {/* Feed de Publicaciones del Muro */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            className={`rounded-2xl border p-5 md:p-6 transition-all shadow-xs space-y-4 ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {/* Cabecera del Post */}
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {post.author}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{post.role}</span>
                    <span>•</span>
                    <span>{post.neighborhood}</span>
                    <span>•</span>
                    <span>{post.time}</span>
                  </div>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  post.category === 'INFRAESTRUCTURA_VERDE'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                }`}
              >
                {post.category === 'INFRAESTRUCTURA_VERDE' ? '🌱 Infraestructura Verde' : '⚠️ Alerta de Drenaje'}
              </span>
            </div>

            {/* Contenido */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {post.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {post.description}
              </p>
            </div>

            {/* Fotografía de la Publicación */}
            {post.photoUrl && (
              <div className="relative w-full h-56 sm:h-72 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800">
                <img
                  src={post.photoUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Barra de Interacción (Likes y Comentarios) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 font-medium transition-colors ${
                    post.hasLiked
                      ? 'text-red-600'
                      : 'text-slate-500 hover:text-red-500'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${post.hasLiked ? 'fill-red-600' : ''}`}
                  />
                  <span>{post.likes} me gusta</span>
                </button>

                <div className="flex items-center gap-1.5 text-slate-500">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.comments.length} comentarios</span>
                </div>
              </div>

              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                Participación Barrial
              </span>
            </div>

            {/* Sección de Comentarios Existentes */}
            {post.comments.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                {post.comments.map((c) => (
                  <div key={c.id} className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                        {c.author}
                      </strong>
                      <span className="text-[10px] text-slate-400">{c.time}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-snug">
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Caja de Comentar */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Escribe un comentario de apoyo o propuesta..."
                value={newCommentTexts[post.id] || ''}
                onChange={(e) =>
                  setNewCommentTexts({ ...newCommentTexts, [post.id]: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddComment(post.id);
                }}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
              />
              <button
                onClick={() => handleAddComment(post.id)}
                className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
                title="Publicar comentario"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* MODAL PARA CREAR NUEVA PUBLICACIÓN EN EL FORO */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all ${
              isDark
                ? 'bg-[#0f172a] border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm">Nueva Publicación en el Foro Barrial</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                  Tu nombre o iniciativa vecinal:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Familia López / Comité Ambiental Sabana Grande"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                  Categoría del post:
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 dark:bg-slate-900"
                >
                  <option value="INFRAESTRUCTURA_VERDE">🌱 Propuesta de Infraestructura Verde / Bio-jardín</option>
                  <option value="DRENAJE_ALERTA">⚠️ Alerta de Anegamiento / Cuello de Botella</option>
                  <option value="LIMPIEZA_BARRIAL">🧹 Jornada de Limpieza y Desarenado</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                  Título de la propuesta o reporte:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Siembra de pasto vetiver en margen oeste"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                  Descripción detallada:
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe qué propones o qué problema estás observando en la cuenca..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                  Fotografía de referencia:
                </label>
                <select
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 dark:bg-slate-900"
                >
                  <option value="/images/reservorio1.jpeg">📸 Foto 1: Cauce y vegetación de retención</option>
                  <option value="/images/reservorio2.jpeg">📸 Foto 2: Punto de drenaje e inspección</option>
                  <option value="/images/reservorio3.jpg">📸 Foto 3: Vertedor y almacenamiento pluvial</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
