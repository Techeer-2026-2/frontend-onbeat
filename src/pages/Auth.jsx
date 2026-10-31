import { useState } from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { login, signup } from '../api/auth';
import { getApiErrorMessage } from '../api/client';

const inputClass = 'w-full rounded-lg border-2 border-neutral-600 bg-transparent px-4 py-4 text-base text-white outline-none transition focus:border-spotify-green';

function AuthShell({ children, title, onBack }) {
  return <main className="min-h-dvh bg-spotify-black px-8 pb-10 pt-8 text-white"><div className="mx-auto flex w-full max-w-md flex-col"><button type="button" onClick={onBack} aria-label="뒤로 가기" className="mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-white"><ArrowLeft size={32}/></button><h1 className="text-center text-3xl font-extrabold tracking-tight">{title}</h1>{children}</div></main>;
}

function AuthForm({ type }) {
  const navigate = useNavigate();
  const isSignup = type === 'signup';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setIsPending(true); setError('');
    try {
      if (isSignup) {
        await signup({ email: email.trim(), password, nickname: nickname.trim() });
        navigate('/auth/login', { replace: true, state: { message: '회원가입이 완료되었습니다. 로그인해 주세요.' } });
      } else {
        await login({ email: email.trim(), password });
        navigate('/home', { replace: true });
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, isSignup ? '회원가입에 실패했어요.' : '로그인에 실패했어요.'));
    } finally { setIsPending(false); }
  };

  return <AuthShell title={isSignup ? '새 계정 만들기' : '로그인'} onBack={() => navigate('/auth')}><form onSubmit={submit} className="mt-28 space-y-8"><label className="block"><span className="mb-4 block text-3xl font-bold">이메일</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} autoComplete="email"/></label>{isSignup && <label className="block"><span className="mb-4 block text-3xl font-bold">닉네임</span><input required value={nickname} onChange={(event) => setNickname(event.target.value)} className={inputClass} autoComplete="nickname"/></label>}<label className="block"><span className="mb-4 block text-3xl font-bold">비밀번호</span><input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} autoComplete={isSignup ? 'new-password' : 'current-password'}/></label>{error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</p>}<button disabled={isPending} className="w-full rounded-full bg-spotify-green py-5 text-xl font-extrabold text-black disabled:opacity-50">{isPending ? '처리 중...' : '계속'}</button></form><div className="mt-20 text-center text-lg text-neutral-300">{isSignup ? '이미 계정이 있나요?' : '계정이 없으신가요?'}<button type="button" onClick={() => navigate(isSignup ? '/auth/login' : '/auth/signup')} className="mt-6 block w-full text-xl font-extrabold text-white">{isSignup ? '로그인하기' : '가입하기'}</button></div></AuthShell>;
}

function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  if (location.pathname === '/auth/login') return <AuthForm type="login"/>;
  if (location.pathname === '/auth/signup') return <AuthForm type="signup"/>;
  return <main className="min-h-dvh bg-spotify-black px-8 pb-10 pt-8 text-white"><div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md flex-col items-center"><button type="button" aria-label="안내" className="self-end rounded-full border-2 border-white p-2"><Info size={24}/></button><div className="flex flex-1 flex-col items-center justify-center text-center"><div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-white text-black text-4xl font-black">O</div><h1 className="text-4xl font-extrabold leading-tight">수많은 곡을 감상해보세요.<br/>ONBEAT에서 무료로 이용할 수 있습니다.</h1></div><div className="w-full space-y-4"><button type="button" onClick={() => navigate('/auth/signup')} className="w-full rounded-full bg-spotify-green py-5 text-xl font-extrabold text-black">무료로 가입하기</button><button type="button" onClick={() => navigate('/auth/login')} className="w-full rounded-full border-2 border-neutral-600 py-5 text-xl font-extrabold">로그인하기</button></div></div></main>;
}

export default Auth;
