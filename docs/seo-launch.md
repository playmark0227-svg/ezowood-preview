# 検索向け公開設定

公開情報は、本文と通常のリンクを含む静的HTMLとして提供します。商品を見るためのページと、注文手続きの画面は公開設定を分けています。

## 公開するページ

- 日本語、英語、繁体字中国語のページには、それぞれ独立したURLがあります。
- 各ページの正規URLは、その言語のURLを自己参照します。翻訳ページを日本語へ統合しません。
- 同じ内容の各言語ページを、`ja`、`en`、`zh-Hant`の`hreflang`で相互に関連付けます。
- ページごとに見出し、説明文、パンくず、共有用の情報を出力します。
- 写真は参考イメージであり、完成品の実物写真ではないことを共有用の説明にも明記します。

## 検索対象にしないページ

カート、購入手続き、完了画面、404ページには、最初のHTMLから`noindex`を指定します。これらはsitemapにも含めません。`noindex`を読み取れるように、robots.txtで同時にクロールを禁止しない運用にします。

## サイトマップと更新日

`sitemap.xml`には検索対象の正規URLだけを掲載します。更新日は実際に確認した重要な更新日を設定し、ビルドのたびに現在時刻へ置き換えません。サイトマップはURLを伝えるためのものであり、検索登録や順位を保証するものではありません。

## robots.txtの配置

robots.txtが有効なのはホストの直下です。GitHub Pagesのプロジェクト配下に置いたrobots.txtでは、ホスト全体のクロール方針を変更できません。このプロジェクトには、誤解を招く配置のrobots.txtを含めていません。

独自ドメインへ移行するときは、ドメイン直下の`/robots.txt`へクロール方針と、実際の`Sitemap:` URLを記載します。購入手続きなどの検索除外は、各HTMLの`noindex`で継続します。

## 構造化データ

ブランド情報には、確認できる名称、URL、ロゴを使用します。パンくずの構造化データは、画面に表示する経路と一致させます。読みものには、掲載内容に一致する記事情報を使用します。

未確定の価格、在庫、販売条件、所在地、認証、著者や公開日時は補いません。商品価格が未定の段階では、架空の価格や入手性を含む販売情報を出力しません。専用の追加テキストファイルや、検索のためだけの特殊なマークアップは不要です。

## 独自ドメインへの移行

1. 使用する正式なドメインを確定し、DNSとHTTPSを設定します。
2. `site-config.js`の公開元URLとベースパスを更新し、HTMLとsitemapを再生成します。
3. 旧URLから新URLへの移動方法を設定し、正規URL、言語リンク、画像URLを確認します。
4. Search ConsoleとBing Webmaster Toolsで所有権を確認し、sitemapを送信します。
5. URL検査でクロール結果と登録状況を確認します。

現在の公開元URLと、将来の独自ドメインは別のURLです。独自ドメインを接続する前に、そのドメインで検索評価が蓄積したとは扱いません。登録期間だけで検索順位が上がることも保証できません。

## 公開時の確認

- 主要URLの直接表示と再読み込みが成功すること。
- スクリプトを実行しなくても主要本文とリンクを読めること。
- 正規URL、言語リンク、sitemapが同じ公開元URLを参照すること。
- 公開情報ページに`noindex`が残っていないこと。
- 購入手続きと404ページには`noindex`があること。
- 表示する情報と構造化データの内容が一致すること。
- 旧形式のリンクから、対応する現在のページへ移動できること。

## 参考資料

- [Google: JavaScriptと検索](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: 正規URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: 多言語ページ](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: サイトマップ](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Google: robots.txt](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt)
- [Google: 検索の拡張機能](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: 所有権の確認](https://support.google.com/webmasters/answer/9008080?hl=ja)
