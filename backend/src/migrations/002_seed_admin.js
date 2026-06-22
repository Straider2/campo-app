import bcrypt from 'bcryptjs';

export async function up(prepare) {
  const existing = prepare('SELECT id FROM usuarios WHERE email = ?').get('admin@campo.com');
  if (existing) return;
  const hash = bcrypt.hashSync('admin123', 10);
  prepare('INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)').run('Administrador', 'admin@campo.com', hash, 'admin');
}
