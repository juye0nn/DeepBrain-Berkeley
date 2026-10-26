# DeepBrain at Berkeley — 웹사이트

이 폴더를 그대로 올리면 로그인 없이 누구나 볼 수 있는 공개 사이트가 돼요.
빌드 과정은 없고, 정적 파일만 있어요.

```
data/content.js   ★ 자주 바뀌는 내용 전부 (프로젝트, 일정, 모집 안내, 문의)
data/members.js   멤버 명단
index.html        잘 안 바뀌는 글 (맨 위 제목, What we do, 멤버 영역 자료 링크)
css/style.css     디자인 (색은 맨 위 :root 블록에서)
js/app.js         동작 코드 (고칠 일 없음)
assets/           로고, 파비콘
```

## 직접 수정하는 방법

대부분은 **`data/content.js` 하나만** 고치면 돼요. 파일 맨 위에 규칙 세 가지가 적혀 있어요.

| 바꾸고 싶은 것 | 고칠 곳 |
|---|---|
| 프로젝트 추가·삭제·수정 | `content.js` → `projects` (블록 하나 복사해서 붙여넣기) |
| 학기 단계, 날짜 | `content.js` → `phases` |
| 미팅 요일·시간 | `content.js` → `facts`와 `schedule` 두 곳 |
| 다음 학기 모집 열기 | `content.js` → `signup.open`을 `true`로, `openTitle`·`openText`·`signupUrl` 채우기 |
| 문의 문구 | `content.js` → `contact` |
| 맨 위 큰 제목, What we do | `index.html`에서 해당 글자 찾아 바꾸기 |
| 멤버 영역 자료 링크 | `index.html`에서 `link not set` 찾아 `href="#"`를 실제 링크로 |
| 색 | `css/style.css` 맨 위 `--accent`(진한 주황), `--glow`(연한 주황) |

GitHub Pages에 올렸다면 github.com 저장소에서 파일을 열고 연필 아이콘(Edit)으로 바로 고친 뒤
**Commit changes**를 누르면 1–2분 뒤 사이트에 반영돼요. 컴퓨터에 아무것도 설치할 필요 없어요.

고친 뒤 사이트 일부가 비어 보이면 `content.js`에 따옴표(")나 쉼표(,)가 빠진 곳이 있는 거예요.
마지막으로 고친 줄 근처를 확인하세요.

**미리 확인하고 싶으면** `index.html`을 더블클릭해서 브라우저로 열어 보세요. 인터넷 없이도 열려요. (멤버 로그인만은 https 주소로 올린 뒤에 작동해요.)

## 올리는 방법 A — GitHub Pages (추천, 무료)

1. github.com에서 **New repository** → 이름 `deepbrain` → **Public** → Create.
2. 저장소 화면에서 **Add file → Upload files**를 누르고, 이 폴더 **안의 내용물 전부**를 끌어다 놓은 뒤 **Commit changes**.
   (`index.html`이 저장소 맨 위에 있어야 해요.)
3. **Settings → Pages** → Source: **Deploy from a branch**, Branch: **main / (root)** → Save.
4. 1–2분 뒤 `https://<깃허브아이디>.github.io/deepbrain/` 에서 열려요.

수정할 때는 파일을 다시 업로드하거나 GitHub에서 바로 편집하면 1–2분 안에 반영돼요.

## 올리는 방법 B — Netlify

1. app.netlify.com에 가입하고 로그인.
2. **Add new site → Deploy manually**에 이 폴더를 통째로 끌어다 놓기.
3. `https://<임의이름>.netlify.app` 주소가 바로 생겨요. Site settings에서 이름을 `deepbrain-berkeley` 같은 걸로 바꿀 수 있어요.

## 도메인 연결 (선택)

`deepbrain.club` 같은 도메인을 샀다면 GitHub Pages는 **Settings → Pages → Custom domain**,
Netlify는 **Domain management**에서 연결해요.

## 꼭 알아둘 것: 멤버 로그인은 보안 장치가 아니에요

정적 사이트라서 `data/members.js`는 누구나 열어볼 수 있어요.

- 이메일은 이미 해시로 바꿔 두었어요 (로그인은 그대로 작동해요). 원래 주소는 파일에서 읽을 수 없어요.
- **`adminKey`(지금 `deepbrain-officers`)는 반드시 바꾸세요.** 그래도 파일을 열면 보이기 때문에, 진짜 비공개 자료는
  Google Drive처럼 자체 권한이 있는 곳에 두고 멤버 영역에는 링크만 걸어 두세요.
- 명단을 바꾸려면 사이트의 Officers → 로스터 콘솔에서 편집 → **Export** → 나온 내용을
  `data/members.js`에 붙여넣고 다시 올리면 돼요. 새로 추가한 이메일은 콘솔의 **Protect emails**로 해시 처리하세요.
- 샘플 멤버 두 명(Example Member, Pending Signup)은 실제 명단을 넣을 때 지우세요.
