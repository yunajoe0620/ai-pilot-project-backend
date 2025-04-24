-- 헤더 처리
function Header(el)
    if el.level == 3 then
      -- 텍스트 추출
      local text = ""
      for _, item in ipairs(el.content) do
        if item.t == "Str" then  -- "Str" 타입은 실제 텍스트
          text = text .. item.text
        end
      end
      -- \subsubsection*로 감싸기
      return pandoc.RawBlock('latex', '\\subsubsection*{' .. text .. '}')
    end
    return el
  end
  