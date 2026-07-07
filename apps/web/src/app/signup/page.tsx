import { redirect } from 'next/navigation';

// Marketing, e-posta kampanyalari ve eski reklam URL'leri /signup'a gelebilir.
// Kayit rotasi (auth) grubu altindaki /register'dir. Bu dosya tek satir alias.
export default function SignupAliasPage(): never {
  redirect('/register');
}
