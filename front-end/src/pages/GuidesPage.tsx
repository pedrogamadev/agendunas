import type { PageProps } from '../App'

type Guide = {
  id: string
  name: string
  photo: string
  speciality: string
  description: string
  trails: number
  experience: string
  rating: number
  certifications: string[]
  languages: string[]
  curiosities: string[]
}

const guides: Guide[] = [
  {
    id: 'joao-mendes',
    name: 'João Mendes',
    photo: 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQq9PMkbtfY_mDBbEI0m6d16exi8x-IEgy2LEOg3sRNSJP4O7RuGDBnqxVQgX9Jg-OJ-C5sVB7GRVvCE9JJCAzFcgQShSv-9mF9KKK3Yn_uYw',
    speciality: 'Fauna e Trilhas Técnicas',
    description:
      'Biólogo especializado em fauna da mata atlântica. Apaixonado por aves e mamíferos, transforma cada trilha em uma aula de biologia ao ar livre.',
    trails: 850,
    experience: '12 anos',
    rating: 4.9,
    certifications: ['Primeiros Socorros', 'Guia de Turismo', 'Condutor Ambiental'],
    languages: ['Português', 'Inglês', 'Espanhol'],
    curiosities: ['Observador de aves credenciado', 'Resgatou 32 animais feridos em expedições', 'Autor do guia “Rastros da Mata”'],
  },
  {
    id: 'maria-fernanda',
    name: 'Maria Fernanda',
    photo: 'data:image/jpeg;base64,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',
    speciality: 'Flora e Plantas Medicinais',
    description:
      'Botânica com foco em plantas medicinais. Lidera trilhas interpretativas apresentando espécies endêmicas e usos tradicionais das comunidades locais.',
    trails: 650,
    experience: '9 anos',
    rating: 4.8,
    certifications: ['Educação Ambiental', 'Primeiros Socorros'],
    languages: ['Português', 'Francês'],
    curiosities: ['Mantém herbário próprio com 210 espécies catalogadas', 'Idealizadora da Trilha dos Sentidos'],
  },
  {
    id: 'carlos-rodrigues',
    name: 'Carlos Rodrigues',
    photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxITEhUSExAVEhUWFhUVFRUXEhUQExUVFRcWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGBAQGi0dFx0tLS0tLSstLS0rLS0tKy0rLS0rLSsrKy0tKy0tLS0tKystLS0rLS0tKzctKy0rLSstLf/AABEIAPcAzAMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAFAQIDBAYAB//EAD8QAAEDAgQDBQUFBQgDAAAAAAEAAhEDBAUSITFBUWEGEyJxkRQygaHBUlOSsdEHFUJi8BYjQ1RyouHxRGOC/8QAGQEAAwEBAQAAAAAAAAAAAAAAAAECAwQF/8QAJREAAgIDAQACAQQDAAAAAAAAAAECEQMhMRIEQTITInGBFCNR/9oADAMBAAIRAxEAPwA7a0QRsFY9nHJNshorkLY5yobRvIKF9q37IREtUT2oHYPZSY1wOVAe113kDyIaYgaAl08RxgFaKs1ZztBYioxxIkgS0jfTWFGRas2wtX5f2Yssc6kS+pmMxrKrEBscZAJ4AfFFqTZoHUTnALePBUbgeFu2hcPRczlo9zF8bw04lV5MyI0gkZxrJ4iUQq4lVZTLmghux4iVQcG6yBs3p/EFcZlNJ7dYJjfYotCniye5U+nDGXjM6ZknSJUL8RqGQHEggQADGhCrNtCC4RpJ801rMrumv5FCas1nin+igzUxB76Qc3wOaYIgjNyJT2XFHI3OxzZIdIB4/wDXzVCnR0Ja4gEA6a/moadKSPEXHxb/AAjyQqM1jyr+w2y+ty3wMdPxOo1CX2aKREaOdO+swCRG6B21NwePFlAIknWADqtjiF3S7kf3jZdOV2gzk8Onmj+DDw1XpA/C8FYabnFwMg7cFn4yuLSANTBBHBELu9y0sgJDjrodIQcUHEDUfEoo1UlK6LTmuqeFojjvBMJXWj9D4wfjGu3w0Q51WpSOaC2Nju068FrezmJC5EO8LmwJiWk8PIbqmtHK8ilmVrSBowyocpGcSRxI0kFavsxhRz5agBbqYMHfyVftNNMGHEHOAMo8GWefNFewjC/vKpJgnKJ6bpQTZp8zJGtLodp4FS+wPRSDAqP3Y9Ai9MaJ4Yuk8YC/uGj92PQJpwCj92PRHcqTIgVgSwb4Qr+VVsOZ4GmOEq8GqhEJamOYrORNcxAFCpTQi/paHyK0D2oViDND5KZ/iy4fkjzy+tJJOxmRCpGzqZBxJc7z1hG6x1PnuorRxdWFMnSDlEcfNcWPbo9ieaWOKkgP+7XjhO3rKnNg4Nhu54cFrLbDc2h01g/RXKeCNbsZXT4RyS+ZklJMwtKxqSTlkc1JUwfN1+i39LChyXVMMZuPCU/EU7G/nZZLz9Hn9K3LAWlsyIVGpbvYYy8C6fL/ALXo37pG5iVFdYKwxm1M6Lnk43o3x/IypXI89pVCZ8JjyA4fNPbbuDmS0lomPNb5mA0gdp5z9FzsFaNW6b6bj5rSKix/5uWN2umHq4c6o+AJ4BEf7NOABPxEaeS1WE2jcgdEEEg+YRS6rU20yTrGp0J/JU4RRlH5WWVqJ5niWHOqEAtLWt2HknYK2tRkMYHNkS2BMcNStRc3NFwzBwhC8zXkspmSSIGxIErPJKlo1+NjypuTjoUvrXNUU9WAvmOAjVb/AALDe4pinmLtSZPUysn2RpudcGZ8AOnWY1XodGid08UlWzH5spSdUS0mqUNSNUgXQeaxuRJlUiWEAeaYTQqFoHtFTTTcfoirbOtwuH/L9FRwTdw5OIWkaFQ2wV7Jcf5l/wAkns1yP/Jd6BGciTKgVgR1K5/zB9AqVwy42NYkeS0j2KpXZISfCo7ZhKjpJHUorg1FxAdDTBIEjUfFD6di99RzWNLjJ005rTYBQIpEEQQ5wPmFx4V+89L5L/1ogoMr948hwAkGCJ4K059bN77G9In6qWgN+BJSm1Bdmdstp5PJywxejqb6oHicD5Nj6qP2jeSkuaoA02Q+pUkf1wXNLI2dMMUVwkrXscVJSxONSJQGvW8UcDxVm2a7bhwWWzY0trcNeJ2VgWuaRMaLP2daNDzRmjebCITTYpJA68s61NuWmQdzqFmrO9NB7zVaamdpYW5ssSZlb/JnWexjs8HkvJiJJ6q3Js3+G8cHUgFiNtTbTp1qYd3dSWkE5i0gmdQqFhcUqVwx75DODuRjQHkn08bqUZpsccoMhp1HXRV+09xTNRj2wW1Q0uaD7pJ8WnBJWz0smWMYb/o3fZG1LWGq736kuPISZ0WttrsDQ+SBW9RrWNDSIAEeSt2tUF0T1XDl9uWjzpOMtyLuN3FYZTRy8cwcJ5RxQ1t7e/8Aq/Cf1ROASdZUjWBe1gTUFfTxMzTm/PAX7decqfof1S+33nKn6H9UVyBL3YWtGRisMEVqrf559QFpmhB6NGLh8DeCjjWpgxQEhCfCQoCiFzVNZMacwI30mNlE8q5ZhgbOaCdws8r/AGmmPoLsrNtKoPBBa1z3OI0cJMa7TpsVUfdNYyQ8Pc8ucIAaA07DTcorc4i2mxzQ2AJjNrI3KzDHis7OdI0A2C4oNp2dzSkgnZU/DmPHUpl287jYK49oywN4Q5xgZSdef6pNuy4rRVY7M13Pgh1e4dGQiNYnkFdqOhxbETsqF4x0zw4mOSRQOvPfgbK/YVdgVSuHZiNNlLa0zmnhCYB91NtSCIkSNOSvWtrA13VbD2DSPiioEDRICOn4SI3UlV2Zrgd+KoVq+VwHPfor9i5rp0/5TF/B57jWGEPLwQxvOCYQa4wYTERtrzK9JxW1YDlIMOPwlAb2yyu89km2uG6ye1v6CODUHGkwFx93TbbgjdlbZddSeZSWNrDWjkAERpsXbHHCk2tnkyyT2rHUfJWGhRsarDAtTA4NSEKaEkIAwmOGoysCyoWyIKdSfcH/ABz6KftEzVp6lPsxogoibUuuFf1aCuNa7H+M0/8AwEQDV3dpisGPrXX3jfwBEbF1SJe4SNoEQldTnZTVTlC580qVHRhjYMxC4zOyRPVQ21ECoGRwn0QqtevdcCDDZhHLFo7xz3HQQAd1zROyqLtR5mEy6aI4aqcs/i4IZiGI02biUMaEt7fOdRHIqWrbNDSHNlC6WPNOgMKeviRKEgK1Sk2Yy6ba6wnVso93cfMciFFnc4yN1XpE03S7U9Uhh+zAgEac+SP2b2kQQse3FY14ckz+1cHUjTggRr76zpwq1GnliNlQsMfp1v4o89PmjdOo0jSEAUsXZmA6Ic+gx7WguyuBAaPtTvJOyK38QdVl7pxc3qDuh8Ers1GIOq03wxrHiNDJHyULby4+5b+I/ohWGXziQHOkrQ0HZl2Yp+lRwZYOLKwvbn7ln4z+ieMRuPuWfiP6K6Gp+Va1RjZR/elx9w38RSfvW4+4b+M/or+VRliAM/jlTM0Rwj5bpbD3QqV9VHjBG0qCzxqjGrzP+koiXI0LAnwhVPG6P2/9rv0RLDrlrz4TKUpUhRjbLbaWXVCMVrGHI/cwGkngsljNyIgHV2nlOi82cm5HqY40gKDlhztif+AtrhLWQCWzyWQv2NL6TPL4Rr+crUXd8KTMrdXQB5lXEJdFx7GGMaZ0heeYpi7XSRJ+iu3+GVa7y+oTrw4BUamEtbIOoO88+YQ6BA6jXJhzea0FldZ4B3Q02LWMgGANQBrmceaP4FhxnM4eSTZSRN7G8CQSOSWtRcWgvGvOEbaREKWqAWQpsryYLES7Zqit6dJkF9N1R3GBoiuJWoa8bwdFRubDO5hkgsEAtgBw5OTRLi/oJWV1QkZNObXCCtlhoa5u+i8/ucLcZcIaYAAH5ot2axGtRPd1hmGkO2BQJmqxGmQ2ozgWktd1hYbA70klrlt8dqzbve10ENJEarAYGDnJ9USCHTR+ywZCNYbWlU7F4cIVilSNN08FOObUic0E0GaalAUVEjdTghemno8ufTi1MIUiYVRJiMV993VDrVg10HoiWNCKo/0j1kqhbDxHzUw4bT6XLegDwCN4W0N15IZRYiLDAWWd0jXCrYuMX2kSsne3AdUptH2pcrGMXviiUGoOJr8oBXDE9BFllfPctHWB6rb3Nu0OEtzHl+qwmEuDbpjiJ8R/JeiWuoNR3H8lZEug+43jL8FUucNadS1F6lQOOyH3teFLHEHHDWA6wBwVqi4DihVxfHhqnU7nQEwFJpQbp811QlU7W/aNyp6160hFAdVtWPGrVF+6m8E2relo8PFOtr506oAuWuH5R9Uj7QEQfEOPMK9b3QOimqUf4gqM2BaVEtzsJmmQY+Kx9k+KpjYn0W+xJoa0nYQVgqDP7x3+qU3wI9NfbDIWuGxHzRnR7YO6CW9QEZTxgjoYVu3rEfBYp07KmrROyzndztOTiE/2Afbf+IqxQOs8wppXq43cTyMupA+pZwPff+IoBfVHh5AqPAH8xWmunaLD4jXJqO81ZERnaTtRb5waZL4EaD9UHp9rADoz5rM1jKjazqFjG0dckmzbW3a8kgBnzWl9vLmarzCxIDhqNxx26rbWVbPSc4dWj6lYZm6NcMVYHxC4OcnrKlwm4z1Mx3gpmL0fePIwEPwdxbVY3mDP5rJcOn7C97Icxw+3HyC3l1WMNYNBAWFqvn4OBW2FUOyk7kApJ2ElsdXrBjVlsSxUSeJ5In2grENgf8rDXVeHTuU6sEwmLhztyByAStuWt0c+DyKp4YwuJJPwUmIWsknKT+aaQ7CA1gh2nmnOdH8Y9Vnfa3U/CGkgc1NZjMSSwz1OnoqaQWaa0qSCCZ6plK6c10HbgoaYLANVVvnnh/RUUOzT2d8ZGnxWht7jMFgMKuC9oJ32PmtZhGhAJSEyj2+uS2kwtJBJWVwOrL9fNGP2k1YNJk7uJhZmyrZXDzhVL8TOPTa1X6jqPmFZFbwkzqIlC7mpow8oP0+qtW7hOuxEFY1o0l0PYbesy+J4bHVWxeUeFUeoXneMktO+nun6FZ3I4bVD6rsxZKicOXFbs9cvLmnlJFQbcwhOHYeHtLozSSQei83eKh/xCpqN5dMGVtVwA2ElaPJZH6L+gDMpAEjStX2R7PC4PePB7tv+4jgiTSRcYtsG4FgVa4d4Gw0HVx0C9AoYQ2hTDMxcdz5o7bW4pt0AaBwAhUcQuAOErkyT9HVjh52ZvEKIiPNArSiBVzdIHRaivTzcNSo6eCFhkwpV1Rq6BF5ScwlwOhWgwHEBVpDWXN0KrYpbgMyndBMKquoOceHLmritGTZpMeMsnovPsScQ4lbSrijKtMkbx7vVZHE2TtuU0DeirQxKq0S1sha7Crd9xTbUkanLx084Qns/RAOUjdaM4Y5mtJxbrm0PHqPirBWNf2ZdkD4EkxlnWJiVJW7O1WOaBBkE9BHAlMfil1GXvAY4mmCU794XNQCagbE6NZqZ80UVUwHi9U0Wgu47AHUa9UNqYwXNEA+ZEEfqiV9Y5oLyXEbShVehrAGiWhOwz2deXOPWI6Ld2bdQsT2es3A5gjOJY+ygYcfHEhoUVbFeiP8AaPRB7mp9l0HyKydGkS9sc/mlxfGH3Bl2w2GsBTYU6YPz4ynJNIUGrC9zdAQ3oVfp14aD0CAXMF+8J93iIDQ1pnms/DsuUkT47VEzMg8EBNbXQJle5LhHIpjSumMaRzSlbJu812+astOm3zVRsKwwCFTQrZV7M4K66qZG6NGrjyC9YtqDKLW0m6BoHxUPZvBW2tuBHjcAXH6JajCSSNgsMkrN8caLxqZtEOr20EkSVJSdGvNWHiWnVZI1ZQtreXjXYSrFwJ6pcNpGXH0Vt1KAVSZICv6MgkrPW1IueWu2d9FqazjkIjWUFrWn8QJBBVWJoDYhh/dkOZpE9VFUtMzc4349PgjVa2zeImQQdPl+azuINqNLS06g6p2SXrFkVW8Fr6dTSOSyVpcsqOGsO5RGy0syARrpqiwY172TqFEbpo4aLqoBOogqGpRB0TbKVkGIQ7j6boe2gB4ne6NSphQdmjU/BJX8Xh2hTY2GsGqZoyiGztxQPt/bgVGO2lsT5LTYNa5W/NB/2g05ZTcOZHyCqHTKfDENP8xVihcubsVVCcCtvKZlbRYfWcTqU0lMBSlVSJsWSngnomNapA3qhgK1zunoVM1zv5VCCP6KfnSA9mu9t0EdWIcY2O6MXg8O6z9wdVxHcXGNkBS1dAm2h28lK/dAE1iw7nTopbpuiXDnzMqSoZDkyQXWpAjkhNSnEzojDjp1CG3b/CSfPbkhFFWtSaQBwAHruluLFuTYbgnmkZTcRpudY4qxWuBAH4vgqIZlcZtctyzI2ABL3ekLRYfXI0IVchs5Tq7NInlwTmuIME8QdOmseibEHWUmuGyko2bJiITcOdIjhIhXK1TuxrqTM/RUKwFiTgwlrRsh1hay8uI+CuVWEmeKnptDR1hQMu0IAjZBe27stu0xMuI5xIRFr5hCu39R/s7A0aF3i8o0Vw6TPh58HhOGXmVAwqVq6DBkoc3mVxLeaYuCBEoI5qanHMeirtUrEMKJ8o5hMT2QnwEh0etXW2qAX41loKJ3N4eCpVqxbJI3XCdpJhtYFu+oV2dZ3WWbeZHZuE6hHbe7D2y0/BMTCmHA66K4ynoZVOyq+JX3uJaQEyQTVgOgDTeUNreKTwV+6aYgfEobeE+FrdkIsWnULdG7niq7aYEl2s7qQVQ3Xnp5JxdzG6omijiFHK9rhyUTXNJnYq3Wfm3QuiIfHNBIZtrhw24xCId4S0yq2GMBIB+COVcPMbKkIzlzVDdAPMqFzzz3GiK3WHFDm2usEKSh9vMBBu3d0RSYBxP0KPV3tptLnaBed9ocZNZ+wygkDWfitIRd2ZzkgWwdVLChbV6KTvOi3MWxUoTRU/lCcHj7IQIkCe0qMP6KRtTokwskDvJOD1GCOSXN0KB2en3TwCBCo3by7SVZvHQeaC311Gi4jsK9RnigqEYgbcmToSOqsWwnVD+1FH+7JVxVkydGrwrEw8ggytTTfAn1XheC9oHUXNkyJXsGF4gKtMOboCFco0iIysS88QMGEIfTcXQOSL1KM/TzUQojfiFmkXYFbSdmJjQK9HGNoVo04B03I/NSspxMoHYPqUQ5qrCwObPHuhaChaAieCtDDgQeqdC9GfsDDw7qt3YPDgCs03DYRvDn5BBVRJk9E9zbtg6LK4vlY6dkcxHEw0HULyntd2icXOpxHX8oV+TL00QdssWc5wpNPhgE9ZWV4rnVCdzKcAtUqJbFHknBNCcmQKAnhMlKHIAkhOaE1pTwUmA4JwKQJc4QB6VeNzCUBxKM0/BHa9UHSYlZ3EG66ei5EdlluwpwJ4ID2vvfARPSEdoDK2SeGy857Q4gatV0HwgwAtccdmWWVAzN8l61+znExUolvFun6LyRoW87EXnd1QwQGu3840W2RaMcfT0x5kQqvfAAg7klS1CeGyoPpkuJnbZcp1WSurQCCeIStr65eEoNVL8+beFLRfUJ1EJhZrqQAaYKVtYjUFB6V07LB0S/vikCWlwkCSFpEykHKLpOpTL+5DBusnfdqmtgs1Qe/wC0FR55ztCG9AkEe0QdUa7KTsTA/i6LzSvcEmHBxy6cF6v2dsHOPeVOWxXn3a+0bSuqgaIBMgeYEqoCloDtePsu+ScarRwco1y1M7Jg5p1n4Qu7wf0CogngpDs7vW8z6FPFRvP5FICuKCRwqN5/JSCqOahgJYHJFATisOY9Qu75vMfJQho5BOgch6IoDbtuNdT5c013M/BUmOl+aRsmX164CSZ0XLFbOp8BfaLGy0ZG6k76rIb6qa8qlzy5RtC6opJHJNtsQIth98QQ4aEEQhcJQSm1Youj3bCbjPQY4mSRqpQ0FeY9me07mPZTf7u3NenMeAARxXPONM6Yysh7jXon90FXqVvFumOr9VBZPdWzsofkIbuDoBExPqCF5vj7yys+qHSNARP1XolW+BFIOYPAGhxgCoYqPecj500dHqmOvRUrQ3vWu7rIa4B70Hve8GXPWLiMhLCc4I4aaK00Zu/+GBw20FctcHiDwnUfBaWvhwtRTqZSQ7USIBAMEg9CFX7R4q21YaLc7C/vJPdl7XmpWNQ1nAV2sFVrSImm73GgOjQJb9vaVWtSa6j3LGXVu9jy8PDaTHsY8VQdGju2tJInVnUlW4WSptGuddDuswIGnPQLyfHLrvKzyTMGJ3lam27ZNcHtN1cCLe4is5lNlbPUdQ7plNoqGSwNeR4m+86MsBZbG71tar3jcx8FNpe8BtSq5jGtdVqAEgOcQSdT1JMlVGNEt2DyEifCQtViobKVJCVIQoSymyuBTAkBSpgKcCgBUspEqQGmswx0ATrv5qTGKbWMIJ4bwuXLCPTolw8+GWTudVKA3kfVcuXSjmfTvB/N6pw7vquXJAhRl4E9F7FhDs1JhknwjfkuXLLIbQ6K9ok/JVLkEHzXLliajaj9YUntTKJzka/HkuXKktkvh532jxX2ms55MNBhojZDO6G8/JcuW64Ysexv83yUkjmlXJghCQklcuQDElcFy5BIhd1XZ+q5cmAod1SylXIA4EJwXLkgP//Z',
    speciality: 'Montanhismo e Histórias Locais',
    description:
      'Condutor apaixonado por histórias da região. Especialista em travessias longas, conduz grupos com foco em fotografia e cultura local.',
    trails: 1200,
    experience: '15 anos',
    rating: 5,
    certifications: ['Resgate em Altura', 'Primeiros Socorros', 'Condutor de Turismo de Aventura'],
    languages: ['Português', 'Inglês'],
    curiosities: ['Participou de expedições internacionais nos Andes', 'Fotógrafo colaborador do projeto “Mata Viva”'],
  },
]

function GuidesPage({ navigation }: PageProps) {
  return (
    <div className="guides-page">
      <header className="page-hero guides-hero">
        {navigation}
        <div className="page-hero-content">
          <span className="section-tag">Guias Especializados</span>
          <h1>Nossos Guias</h1>
          <p>
            Conheça os especialistas que transformarão sua aventura inesquecível. Cada guia traz uma paixão única pela
            natureza e anos de experiência nas trilhas da mata atlântica.
          </p>
        </div>
      </header>

      <main className="page-main guides-main">
        <section className="guide-grid" aria-label="Guias disponíveis para condução de trilhas">
          {guides.map((guide) => (
            <article key={guide.id} className="guide-card">
              <div className="guide-card-header">
                <div className="guide-avatar">
                  <img src={guide.photo} alt={`Foto do guia ${guide.name}`} loading="lazy" />
                  <span className="guide-rating" aria-label={`Avaliação ${guide.rating.toFixed(1)} de 5`}>
                    ★ {guide.rating.toFixed(1)}
                  </span>
                </div>
                <div className="guide-headline">
                  <span className="guide-trails">{guide.trails} trilhas guiadas</span>
                  <h2>{guide.name}</h2>
                  <p className="guide-speciality">{guide.speciality}</p>
                </div>
              </div>

              <p className="guide-description">{guide.description}</p>

              <dl className="guide-meta">
                <div className="guide-meta-item">
                  <dt>Tempo de atuação</dt>
                  <dd>{guide.experience}</dd>
                </div>
                <div className="guide-meta-item">
                  <dt>Idiomas</dt>
                  <dd>{guide.languages.join(' · ')}</dd>
                </div>
              </dl>

              <div className="guide-chips">
                {guide.certifications.map((certification) => (
                  <span key={certification} className="chip">
                    {certification}
                  </span>
                ))}
              </div>

              <ul className="guide-curiosities">
                {guide.curiosities.map((curiosity) => (
                  <li key={curiosity}>{curiosity}</li>
                ))}
              </ul>

              <button type="button" className="btn solid guide-cta">
                Solicitar este guia
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}

export default GuidesPage
